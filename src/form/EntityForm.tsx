import React, { useEffect } from "react";
import {
    Box,
    Button,
    Container,
    createStyles,
    Grid,
    makeStyles,
    Typography
} from "@material-ui/core";
import { Entity, EntitySchema, EntityStatus, EntityValues } from "../models";
import { Form, Formik, FormikHelpers } from "formik";
import { createCustomIdField, createFormField } from "./index";
import { initEntityValues } from "../firebase/firestore";
import { getYupObjectSchema } from "./validation";
import deepEqual from "deep-equal";
import { ErrorFocus } from "./ErrorFocus";

export const useStyles = makeStyles(theme => createStyles({
    stickyButtons: {
        marginTop: theme.spacing(2),
        backgroundColor: "#ffffffb8",
        borderTop: "solid 1px #f9f9f9",
        position: "sticky",
        bottom: 0,
        zIndex: 200
    },
    container: {
        height: "100%",
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    },
    button: {
        margin: theme.spacing(1)
    },
    form: {
        marginTop: theme.spacing(2)
    }
}));

interface EntityFormProps<S extends EntitySchema> {

    /**
     * New or existing status
     */
    status: EntityStatus;

    /**
     * Path of the collection this entity is located
     */
    collectionPath: string;

    /**
     * Schema of the entity this form represents
     */
    schema: S;

    /**
     * The updated entity is passed from the parent component when the underlying data
     * has changed in Firestore
     */
    entity?: Entity<S>;

    /**
     * The callback function called when Save is clicked and validation is correct
     */
    onEntitySave(schema: S, collectionPath: string, id: string | undefined, values: EntityValues<S>): Promise<void>;

    /**
     * The callback function called when discard is clicked
     */
    onDiscard(): void;

    /**
     * The callback function when the form original values have been modified
     */
    onModified(dirty: boolean): void;

    containerRef: React.RefObject<HTMLDivElement>

}

function EntityForm<S extends EntitySchema>({
                                                status,
                                                collectionPath,
                                                schema,
                                                entity,
                                                onEntitySave,
                                                onDiscard,
                                                onModified,
                                                containerRef
                                            }: EntityFormProps<S>) {

    const classes = useStyles();

    /**
     * Base values are the ones this view is initialized from, we use them to
     * compare them with underlying changes in Firestore
     */
    let baseValues: EntityValues<S>;
    if (status === EntityStatus.new) {
        baseValues = (initEntityValues(schema));
    } else if (status === EntityStatus.existing && entity) {
        baseValues = entity.values as EntityValues<S> || initEntityValues(schema);
    } else {
        throw new Error("Form configured wrong");
    }

    const [customId, setCustomId] = React.useState<string | undefined>(undefined);
    const [customIdError, setCustomIdError] = React.useState<boolean>(false);
    const [savingError, setSavingError] = React.useState<any>();
    const [initialValues, setInitialValues] = React.useState<EntityValues<S> | undefined>(entity?.values);

    let underlyingChanges: Partial<EntityValues<S>> | undefined;
    if (initialValues) {
        underlyingChanges = Object.keys(schema.properties)
            .map((key) => {
                const initialValue = initialValues[key];
                const latestValue = baseValues[key];
                if (!deepEqual(initialValue, latestValue)) {
                    return { [key]: latestValue };
                }
                return {};
            })
            .reduce((a, b) => ({ ...a, ...b }), {}) as EntityValues<S>;
    }

    const mustSetCustomId: boolean = status === EntityStatus.new && !!schema.customId;

    function saveValues(values: EntityValues<S>, actions: FormikHelpers<EntityValues<S>>) {

        console.log("Saving values", values);

        if (mustSetCustomId && !customId) {
            console.error("Missing custom Id");
            setCustomIdError(true);
            actions.setSubmitting(false);
            return;
        }
        setSavingError(null);
        setCustomIdError(false);

        let id: string | undefined;
        if (status === EntityStatus.existing) {
            if (!entity?.id) throw Error("Form misconfiguration when saving, no id for existing entity");
            id = entity.id;
        } else if (status === EntityStatus.new) {
            if (schema.customId) {
                if (!customId) throw Error("Form misconfiguration when saving, customId should be set");
                id = customId;
            }
        } else {
            throw Error("New FormType added, check EntityForm");
        }

        onEntitySave(schema, collectionPath, id, values)
            .then(_ => {
                setInitialValues(values);
                actions.setTouched({});
            })
            .catch(e => {
                console.error(e);
                setSavingError(e);
            })
            .finally(() => {
                actions.setSubmitting(false);
            });

    }

    const validationSchema = getYupObjectSchema(schema.properties);

    function buildButtons(isSubmitting: boolean) {
        return <Box textAlign="right">
            {status === EntityStatus.existing &&
            <Button
                variant="text"
                color="primary"
                disabled={isSubmitting}
                className={classes.button}
                type="reset"
            >
                Discard
            </Button>}
            <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitting}
                className={classes.button}
            >
                Save
            </Button>
        </Box>;
    }

    return (
        <Formik
            initialValues={baseValues as EntityValues<S>}
            onSubmit={saveValues}
            validationSchema={validationSchema}
            validate={(values) => console.debug("Validating", values)}
            onReset={() => onDiscard && onDiscard()}
        >
            {({ values, touched, dirty, setFieldValue, setFieldTouched, handleSubmit, isSubmitting }) => {

                useEffect(() => {
                    onModified(dirty);
                }, [dirty]);

                if (underlyingChanges && entity) {
                    // we update the form fields from the Firestore data
                    // if they were not touched
                    Object.entries(underlyingChanges).forEach(([key, value]) => {
                        const formValue = values[key];
                        if (!deepEqual(value, formValue) && !touched[key]) {
                            setFieldValue(key, !!value ? value : null);
                            setFieldTouched(key, false);
                        }
                    });
                }

                function createFormFields(schema: EntitySchema) {

                    return <Grid container spacing={4}>

                        {Object.entries(schema.properties).map(([key, property]) => {

                            const underlyingValueHasChanged: boolean =
                                !!underlyingChanges
                                && Object.keys(underlyingChanges).includes(key)
                                && !!touched[key];

                            const formField = createFormField(
                                {
                                    name: key,
                                    property,
                                    includeDescription: true,
                                    underlyingValueHasChanged,
                                    entitySchema: schema,
                                    partOfArray: false
                                });

                            return <Grid item
                                         xs={12}
                                         id={`form_field_${key}`}
                                         key={`field_${schema.name}_${key}`}>
                                {formField}
                            </Grid>;
                        })}

                    </Grid>;
                }

                return (
                    <Container maxWidth={"sm"}
                               className={classes.container}>

                        {createCustomIdField(schema, status, setCustomId, customIdError, entity)}

                        <Box pt={3}>

                            <Form className={classes.form}
                                  onSubmit={handleSubmit}
                                  noValidate>

                                {createFormFields(schema)}

                                {savingError &&
                                <Box textAlign="right">
                                    <Typography color={"error"}>
                                        Error saving to Firestore. Details
                                        in
                                        the console
                                    </Typography>
                                </Box>}

                                <Box className={classes.stickyButtons}>
                                    {buildButtons(isSubmitting)}
                                </Box>

                            </Form>

                        </Box>

                        <ErrorFocus containerRef={containerRef}/>

                    </Container>
                );
            }}
        </Formik>
    );
}

export default React.memo<EntityFormProps<any>>(EntityForm);
