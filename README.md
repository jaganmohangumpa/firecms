# FireCMS

> Awesome Firestore based headless CMS, developed by Camberi

FireCMS is a headless CMS built by developers for developers. It generates CRUD
views based on your configuration.
You define views that are mapped to absolute or relative paths in your Firestore
database, as well as schemas for your entities.

Note that this is a full application, with routing enabled and not a simple
component. It has only been tested as an application and not as part of a
different one.

It is currently in an alpha state, and we continue working to add features
and expose internal APIs, so it is safe to expect breaking changes.

[![NPM](https://img.shields.io/npm/v/firecms.svg)](https://www.npmjs.com/package/firecms) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

#### Core technologies

FireCMS is based on this great technologies:
 - Typescript
 - Firebase
 - React + React Router
 - Material UI
 - Formik
 - Yup

#### Demo

Check the demo with all the core functionalities. You can modify the data but it
gets periodically restored.

https://firecms-demo-27150.web.app/

## Install

```bash
npm install --save firecms
```

## Firebase requirements

You need to enable the Firestore database in your Firebase project.
If you have enabled authentication in the CMS config you need to enable Google
authentication in your project.

Also, if you are using storage fields in your string properties, you need to
enable Firebase Storage


### Deployment to Firebase hosting

If you are deploying this project to firebase hosting, you can omit the
firebaseConfig specification, since it gets picked up automatically.

## Current status
- [x] Create, read, update, delete views
- [x] Form for editing entities
- [x] Implementation of fields for every property (except Geopoint)
- [x] Native support for Google Storage references and file upload.
- [ ] Geopoint field
- [x] Real-time Collection view for entities
- [x] Custom additional views in main navigation
- [x] Custom fields defined by the developer.
- [ ] Improve error handling when unexpected formats come from Firestore
- [x] Subcollection support
- [x] Filters (only for string and numbers)
- [ ] Filters for arrays, dates
- [x] Custom authenticator
- [x] Validation for required fields using yup
- [ ] Additional Validation (all yup supported properties, such as min or max value)
- [ ] Unit testing


## Quick example

```tsx
import React from "react";
import ReactDOM from "react-dom";

import { CMSApp, EntitySchema, EnumValues, Authenticator, EntityCollectionView } from "firecms";
import  firebase from "firebase";

const status = {
    private: "Private",
    public: "Public"
};

const categories: EnumValues<string> = {
    electronics: "Electronics",
    books: "Books",
    furniture: "Furniture",
    clothing: "Clothing",
    food: "Food"
};

const locales = {
    "de-DE": "German",
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "es-419": "Spanish (South America)"
};

export const productSchema: EntitySchema = {
    customId: true,
    name: "Product",
    properties: {
        name: {
            title: "Name",
            includeInListView: true,
            validation: { required: true },
            dataType: "string"
        },
        price: {
            title: "Price",
            includeInListView: true,
            validation: { required: true },
            dataType: "number"
        },
        status: {
            title: "Status",
            includeInListView: true,
            validation: { required: true },
            dataType: "string",
            enumValues: status
        },
        categories: {
            title: "Categories",
            includeInListView: true,
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string",
                enumValues: categories
            }
        },
        image: {
            title: "Image",
            dataType: "string",
            includeInListView: true,
            storageMeta: {
                mediaType: "image",
                storagePath: "images",
                acceptedFiles: ["image/*"]
            }
        },
        tags: {
            title: "Tags",
            includeInListView: true,
            description: "Example of generic array",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        description: {
            title: "Description",
            description: "Not mandatory but it'd be awesome if you filled this up",
            includeInListView: false,
            dataType: "string"
        },
        published: {
            title: "Published",
            includeInListView: true,
            dataType: "boolean"
        },
        expires_on: {
            title: "Expires on",
            includeInListView: false,
            dataType: "timestamp"
        },
        publisher: {
            title: "Publisher",
            includeInListView: true,
            description: "This is an example of a map property",
            dataType: "map",
            properties: {
                name: {
                    title: "Name",
                    includeInListView: true,
                    dataType: "string"
                },
                external_id: {
                    title: "External id",
                    includeInListView: true,
                    dataType: "string"
                }
            }
        },
        available_locales: {
            title: "Available locales",
            description:
                "This field is set automatically by Cloud Functions and can't be edited here",
            includeInListView: true,
            dataType: "array",
            disabled: true,
            of: {
                dataType: "string"
            }
        }
    },
    subcollections: [
        {
            name: "Locales",
            relativePath: "locales",
            schema: {
                customId: locales,
                name: "Locale",
                properties: {
                    title: {
                        title: "Title",
                        validation: { required: true },
                        includeInListView: true,
                        dataType: "string"
                    },
                    selectable: {
                        title: "Selectable",
                        description: "Is this locale selectable",
                        includeInListView: true,
                        dataType: "boolean"
                    },
                    video: {
                        title: "Video",
                        dataType: "string",
                        validation: { required: false },
                        includeInListView: true,
                        storageMeta: {
                            mediaType: "video",
                            storagePath: "videos",
                            acceptedFiles: ["video/*"]
                        }
                    }
                }
            }
        }
    ]
};

const navigation: EntityCollectionView<any>[] = [
    {
        relativePath: "products",
        schema: productSchema,
        name: "Products"
    },
];

const myAuthenticator:Authenticator = (user?: firebase.User) => {
    console.log("Allowing access to", user?.email)
    return true;
};

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

ReactDOM.render(
    <CMSApp
        name={"Test shop CMS"}
        authentication={myAuthenticator}
        navigation={navigation}
        firebaseConfig={firebaseConfig}
    />,
    document.getElementById("root")
);

```

#### Included example

You can access the code for the demo project under `example`. It includes
every feature provided by this CMS.

To get going you just need to set you Firebase config in `firebase_config.ts`
and run `yarn start`


## Entities configuration

The core of the CMS are entities, which are defined by an `EntitySchema`. In the
schema you define the properties, which are related to the Firestore data types.

  - name: A singular name of the entity as displayed in an Add button.
        E.g. Product
  - description: Description of this entity
  - customId: If this property is not set Firestore will create a random ID.
        You can set the value to true to allow the users to choose the ID.
        You can also pass a set of values (as an `EnumValues` object) to allow them
        to pick from only those
  - properties: Object defining the properties for the entity schema

### Subcollections


### Data types
### Custom fields


## Collection configuration
### Additional columns
### Text search

### Filters


## License

GPL-3.0 © [camberi](https://github.com/camberi)
