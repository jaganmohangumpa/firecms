import React from "react";
import ReactDOM from "react-dom";
import logo from "./images/test_shop_logo.png";
import GitHubIcon from "@material-ui/icons/GitHub";

import "typeface-rubik";

import * as serviceWorker from "./serviceWorker";

import {
    AdditionalColumnDelegate,
    AsyncPreviewComponent,
    Authenticator,
    buildCollection,
    buildSchema,
    CMSApp,
    EntityCollectionView,
    EntitySaveProps,
    EnumValues
} from "@camberi/firecms";

import { firebaseConfig } from "./firebase_config";
import CustomColorTextField from "./custom_field/CustomColorTextField";
import { User } from "firebase/app";
import CustomBooleanPreview from "./custom_preview/CustomBooleanPreview";
import {
    blogSearchDelegate,
    productsSearchDelegate,
    usersSearchDelegate
} from "./algolia_utils";
import PriceTextPreview from "./custom_preview/PriceTextPreview";
import { IconButton, Tooltip } from "@material-ui/core";
import { Properties } from "../../src";

const locales: EnumValues<string> = {
    "es": "Spanish",
    "de": "German",
    "en": "English",
    "it": "Italian",
    "fr": "French"
};

const categories: EnumValues<string> = {
    art_and_decoration: "Art and decoration",
    art_design_books: "Art and design books",
    babys: "Babies and kids",
    backpacks: "Backpacks and bags",
    bath: "Bath",
    bicycle: "Bicycle",
    books: "Books",
    cameras: "Cameras",
    clothing_man: "Clothing man",
    clothing_woman: "Clothing woman",
    coffee_and_tea: "Coffee and tea",
    cookbooks: "Cookbooks",
    delicatessen: "Delicatessen",
    desk_accessories: "Desk accessories",
    exercise_equipment: "Exercise equipment",
    furniture: "Furniture",
    gardening: "Gardening",
    headphones: "Headphones",
    home_accessories: "Home accessories",
    home_storage: "Home storage",
    kitchen: "Kitchen",
    lighting: "Lighting",
    music: "Music",
    outdoors: "Outdoors",
    personal_care: "Personal care",
    photography_books: "Photography books",
    serveware: "Serveware",
    smart_home: "Smart Home",
    sneakers: "Sneakers",
    speakers: "Speakers",
    sunglasses: "Sunglasses",
    toys_and_games: "Toys and games",
    watches: "Watches"
};

const productSchema = buildSchema({
    name: "Product",
    properties: {
        name: {
            dataType: "string",
            title: "Name",
            validation: {
                required: true
            }
        },
        main_image: {
            dataType: "string",
            title: "Image",
            config: {
                storageMeta: {
                    mediaType: "image",
                    storagePath: "images",
                    acceptedFiles: ["image/*"],
                    metadata: {
                        cacheControl: "max-age=1000000"
                    }
                }
            },
            description: "Upload field for images",
            validation: {
                required: true
            }
        },
        category: {
            dataType: "string",
            title: "Category",
            config: {
                enumValues: categories
            }
        },
        price: {
            dataType: "number",
            title: "Price",
            validation: {
                requiredMessage: "You must set a price between 0 and 1000",
                min: 0,
                max: 1000
            },
            config: {
                customPreview: PriceTextPreview
            },
            description: "Price with range validation"
        },
        currency: {
            dataType: "string",
            title: "Currency",
            config: {
                enumValues: {
                    EUR: "Euros",
                    DOL: "Dollars"
                }
            },
            validation: {
                required: true
            }
        },
        public: {
            dataType: "boolean",
            title: "Public",
            description: "Should this product be visible in the website",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros."
        },
        brand: {
            dataType: "string",
            title: "Brand",
            validation: {
                required: true
            }
        },
        description: {
            dataType: "string",
            title: "Description",
            description: "Example of a markdown field",
            config: {
                markdown: true
            }
        },
        available: {
            dataType: "boolean",
            title: "Available",
            columnWidth: 100
        },
        amazon_link: {
            dataType: "string",
            title: "Amazon link",
            config: {
                url: true
            }
        },
        added_on: {
            dataType: "timestamp",
            title: "Added on",
            disabled: true,
            serverTimestamp: "on_create"
        },
        images: {
            dataType: "array",
            title: "Images",
            of: {
                dataType: "string",
                config: {
                    storageMeta: {
                        mediaType: "image",
                        storagePath: "images",
                        acceptedFiles: ["image/*"],
                        metadata: {
                            cacheControl: "max-age=1000000"
                        }
                    }
                }
            },
            description: "This fields allows uploading multiple images at once"
        },
        related_products: {
            dataType: "array",
            title: "Related products",
            description: "Reference to self",
            of: {
                dataType: "reference",
                collectionPath: "products",
                schema: "self"
            }
        },
        publisher: {
            title: "Publisher",
            description: "This is an example of a map property",
            dataType: "map",
            properties: {
                name: {
                    title: "Name",
                    dataType: "string"
                },
                external_id: {
                    title: "External id",
                    dataType: "string"
                }
            }
        },
        min_known_price: {
            dataType: "number",
            title: "Min known price",
            disabled: true,
            description: "Minimum price this product has ever had"
        },
        prime_eligible: {
            dataType: "boolean",
            title: "Prime eligible",
            disabled: true
        },
        available_locales: {
            title: "Available locales",
            description:
                "This is an example of a disabled field that gets updated trough a Cloud Function, try changing a locale 'selectable' value",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
            dataType: "array",
            disabled: true,
            of: {
                dataType: "string",
                config: {
                    enumValues: locales
                }
            }
        },
        uppercase_name: {
            title: "Uppercase Name",
            dataType: "string",
            disabled: true,
            description: "This field gets updated with a preSave hook"
        }

    },
    defaultValues: {
        currency: "EUR",
        publisher: {
            name: "Default publisher"
        }
    }
});


const blogSchema = buildSchema({
    name: "Blog entry",
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            dataType: "string"
        },
        gold_text: {
            title: "Gold text",
            description: "This field is using a custom component defined by the developer",
            dataType: "string",
            config: {
                field: CustomColorTextField,
                fieldProps: {
                    color: "gold"
                }
            }
        },
        long_text: {
            title: "Long text",
            description: "Example of a long text",
            validation: { required: true },
            dataType: "string",
            config: {
                multiline: 6
            }
        },
        images: {
            title: "Images",
            dataType: "array",
            of: {
                dataType: "string",
                config: {
                    storageMeta: {
                        mediaType: "image",
                        storagePath: "images",
                        acceptedFiles: ["image/*"],
                        metadata: {
                            cacheControl: "max-age=1000000"
                        }
                    }
                }
            },
            description: "This fields allows uploading multiple images at once and reordering"
        },
        priority: {
            title: "Priority",
            description: "This field allows the selection of Infinity as a value",
            dataType: "number",
            config: {
                fieldProps: {
                    allowInfinity: true
                }
            }
        },
        reviewed: {
            title: "Reviewed",
            dataType: "boolean",
            config: {
                customPreview: CustomBooleanPreview
            }
        },
        status: {
            title: "Status",
            validation: { required: true },
            dataType: "string",
            config: {
                enumValues: {
                    published: "Published",
                    draft: "Draft"
                }
            }
        },
        content: {
            title: "Content",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        products: {
            title: "Products",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "reference",
                collectionPath: "products",
                schema: productSchema,
                textSearchDelegate: productsSearchDelegate,
                previewProperties: ["name", "main_image"]
            }
        },
        tags: {
            title: "Tags",
            description: "Example of generic array",
            dataType: "array",
            of: {
                dataType: "string",
                config: {
                    previewAsTag: true
                }
            }
        }
    },
    defaultValues: {
        status: "draft",
        tags: ["default tag"]
    }
});

const usersSchema = buildSchema({
    name: "User",
    properties: {
        first_name: {
            title: "First name",
            dataType: "string"
        },
        last_name: {
            title: "Last name",
            dataType: "string"
        },
        email: {
            title: "Email",
            dataType: "string",
            validation: {
                email: true
            }
        },
        phone: {
            title: "Phone",
            dataType: "string"
        },
        picture: {
            title: "Picture",
            dataType: "map",
            properties: {
                large: {
                    title: "Large",
                    dataType: "string",
                    config: {
                        url: "image"
                    },
                    validation: {
                        url: true
                    }
                },
                thumbnail: {
                    title: "Thumbnail",
                    dataType: "string",
                    config: {
                        url: "image"
                    },
                    validation: {
                        url: true
                    }
                }
            },
            previewProperties: ["large"]
        }
    }
});


const productAdditionalColumn: AdditionalColumnDelegate<typeof productSchema> = {
    id: "spanish_title",
    title: "Spanish title",
    builder: (entity) =>
        <AsyncPreviewComponent builder={
            entity.reference.collection("locales")
                .doc("es")
                .get()
                .then((snapshot: any) => snapshot.get("name") as string)
        }/>
};


const localeSchema = buildSchema({
    customId: locales,
    name: "Locale",
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            dataType: "string"
        },
        description: {
            title: "Description",
            validation: { required: true },
            dataType: "string",
            config: {
                multiline: true
            }
        },
        selectable: {
            title: "Selectable",
            description: "Is this locale selectable",
            longDescription: "Changing this value triggers a cloud function that updates the parent product",
            dataType: "boolean"
        },
        video: {
            title: "Video",
            dataType: "string",
            validation: { required: false },
            config: {
                storageMeta: {
                    mediaType: "video",
                    storagePath: "videos",
                    acceptedFiles: ["video/*"]
                }
            },
            columnWidth: 400
        }
    }
});

productSchema.onPreSave = ({
                               schema,
                               collectionPath,
                               id,
                               values,
                               status
                           }: EntitySaveProps<typeof productSchema>) => {
    values.uppercase_name = values.name.toUpperCase();
    return values;
};

productSchema.onSaveSuccess = () => {
    console.log("onSaveSuccess");
};

const formQuestions: string[] = ["birth_year",
    "living_situation",
    "electricity_monthly",
    "heating_fuels_used",
    "heating_fuels_consumption_monthly"];

export const testEntitySchema = buildSchema({
    customId: true,
    name: "Test entity",
    properties: {
        images: {
            title: "Image URLs",
            dataType: "array",
            of: {
                dataType: "string",
                config: {
                    storageMeta: {
                        mediaType: "image",
                        storagePath: "images",
                        acceptedFiles: ["image/*"],
                    }
                }
            }
        },
        image: {
            title: "Image",
            dataType: "string",
            config: {
                storageMeta: {
                    mediaType: "image",
                    storagePath: "test",
                    acceptedFiles: ["image/*"]
                }
            }
        },
        mark: {
            title: "Mark",
            dataType: "string",
            config: {
                markdown: true
            }
        },
        tags: {
            title: "Tags",
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        product: {
            title: "Product",
            dataType: "reference",
            collectionPath: "products",
            schema: productSchema,
            textSearchDelegate: productsSearchDelegate,
            previewProperties: ["name", "main_image"]
        },
        created_at: {
            title: "Created at",
            dataType: "timestamp",
            autoValue: "on_create"
        },
        updated_on: {
            title: "Updated on",
            dataType: "timestamp",
            autoValue: "on_update"
        },
        title: {
            title: "Title",
            validation: { required: true },
            description: "A catching title is important",
            dataType: "string"
        },
        description: {
            title: "Description",
            dataType: "string",
            config: {
                multiline: true
            }
        },
        search_adjacent: {
            title: "Search adjacent",
            dataType: "boolean"
        },
        difficulty: {
            title: "Difficulty",
            dataType: "number",
            validation:{
                required:true
            }
        },
        range: {
            title: "Range",
            validation: {
                min: 0,
                max: 3
            },
            dataType: "number"
        },
        pdf: {
            title: "Pdf",
            dataType: "string",
            config: {
                storageMeta: {
                    storagePath: "test"
                }
            }
        },
        form_conditions: {
            dataType: "array",
            title: "Form conditions",
            of: {
                dataType: "map",
                properties: {
                    type: {
                        dataType: "string",
                        title: "Type",
                        config: {
                            enumValues: {
                                possible_ids: "Possible ids"
                            }
                        },
                        validation: {
                            required: true
                        }
                    },
                    condition: {
                        dataType: "map",
                        title: "Condition",
                        config: {
                            pickOnlySomeKeys: true
                        },
                        properties: formQuestions.map((questionId) => ({
                            [questionId]: {
                                dataType: "array",
                                title: questionId,
                                of: {
                                    dataType: "string",
                                    validation: {
                                        required: true
                                    }
                                }
                            }
                        } as Properties)).reduce((a, b) => ({ ...a, ...b }))
                    }
                }
            }
        }
    }
});

const localeCollection: EntityCollectionView<typeof localeSchema> =
    buildCollection({
        name: "Locales",
        relativePath: "locales",
        deleteEnabled: true,
        schema: localeSchema,
        defaultSize: "l"
    })
;

const productsCollection = buildCollection({
    relativePath: "products",
    schema: productSchema,
    name: "Products",
    textSearchDelegate: productsSearchDelegate,
    additionalColumns: [productAdditionalColumn],
    subcollections: [localeCollection],
    excludedProperties: ["images", "related_products"],
    filterableProperties: ["price", "available_locales"]
});

const usersCollection = buildCollection({
    relativePath: "users",
    schema: usersSchema,
    name: "Users",
    textSearchDelegate: usersSearchDelegate,
    properties: ["first_name", "last_name", "email", "phone", "picture"]
});

const blogCollection = buildCollection({
    relativePath: "blog",
    schema: blogSchema,
    name: "Blog",
    textSearchDelegate: blogSearchDelegate,
    properties: ["name", "images", "status", "reviewed", "products", "long_text"],
    filterableProperties: ["name", "status"],
    initialFilter: {
        "status": ["==", "published"]
    },
    onEntityDelete: (path, entity) => {
        console.log("Log from onEntityDelete hook", entity);
    }
});

const navigation: EntityCollectionView[] = [
    productsCollection,
    usersCollection,
    blogCollection
];

if (process.env.NODE_ENV !== "production") {
    navigation.push(buildCollection({
        relativePath: "test_entity",
        schema: testEntitySchema,
        group: "Test group",
        name: "Test entity",
        filterableProperties: ["difficulty", "search_adjacent", "description"],
        subcollections : [{
            relativePath: "test_subcollection",
            schema: testEntitySchema,
            name: "Test entity",
            filterableProperties: ["difficulty", "search_adjacent", "description"],
        }]
    }));
}

const myAuthenticator: Authenticator = (user?: User) => {
    console.log("Allowing access to", user?.email);
    return true;
};

const githubLink = (
    <Tooltip
        title="See this project on GitHub. This button is only present in this demo">
        <IconButton
            href={"https://github.com/Camberi/firecms"}
            rel="noopener noreferrer"
            target="_blank"
            component={"a"}>
            <GitHubIcon/>
        </IconButton>
    </Tooltip>
);

ReactDOM.render(
    <CMSApp
        name={"My Online Shop"}
        authentication={myAuthenticator}
        allowSkipLogin={true}
        logo={logo}
        navigation={navigation}
        // In the production environment
        firebaseConfig={process.env.NODE_ENV !== "production" ? firebaseConfig : undefined}
        toolbarExtraWidget={githubLink}
    />,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register();
serviceWorker.unregister();


