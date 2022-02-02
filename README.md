# Model Registry Server

The Model Registry is a repository used to store trained machine learning models and datasets. In addition to the models\datasets, the registry stores information (metadata) about the training jobs used to create the model, hyperparameter values and performance metrics. These values allows for simple comparison of models\datasets. Each model\dataset stored in the registry is assigned a unique identifier and a list of multiple versions.

The Model Registry is developed using [Node JS](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/).

In order to use the registry, you need a valid account (username and password) and an online server running the service ({{url}})
Ask riccardo.berta@unige.it to get a valid account and a server URL.

The file registry.postman_collection.json contains examples of calls for the [PostMan](https://www.postman.com/) tool

## Quick start

Clone code and run the container

    git clone https://github.com/measurify/model-registry registry
    cd registry
    docker-compose up -d

to see logs:

    sudo docker logs registry

to update the registry:

    sudo docker kill $(sudo docker ps -q)
    sudo docker system prune -a
    cd ~/registry
    sudo git pull
    sudo docker-compose up -d --build

to get info:

    sudo docker exec -it registry pm2 show registry 

## Documentation

It is possible to get information about routes and data models from the following route:

    {{url}}/docs.html

## Concepts

The Model Registry introduces a few concepts that describe and facilitate the full lifecycle of a ML model or dataset:

- **Model**: an ML model created from an experiment to be registered on the system
- **Dataset**: a dataset used to train models
- **Version**: each registered model\dataset can have many versions, which is a specific file (e.g. a .onxx file for a model, a .zip file for a dataset)
- **Metadata**: a list of name-value pairs that can be used to annotate models and datasets, including training condition, algorithm descriptions, hyperparameters employed and any relevant information useful for the user to apply the model or use the dataset
- **Tag**: a label that can be used to categorize models/datasets 

## Workflow

### Tenant

The Model Registry supports multitenancy (a single instance runs on a server and serves multiple tenants). Tenants are managed by the super user of the system. At startup, the Model Registry has a default tenant.

To create a new tenant:

    POST {{url}}/v1/tenants/

    {
        "_id": "registry-tenat-test",
        "organization": "Measurify org",
        "address": "Measurify Street, Genova",
        "email": "info@measurify.org",
        "phone": "+39103218793817",
        "admin_username": "pluto",
        "admin_password": "pippo",
        "passwordhash": "true"
    }

The call needs the **API_TOKEN** in the header parameter:

    Authorization: API_TOKEN

The API_TOKEN is specified in the init\variables.env file.

To delete a tenant:

    DELETE {{url}}/v1/tenants/{{tenant}}

### Login

Model Registry can be accessed with a token than can be obtained with the following call:

    POST {{url}}/login

    {
        "username" : "username",  
        "password" : "password",
        "tenant": "tenant"
    }

If **tenant** is not specified, the default one is used.

After the call, we get a token to be used for all other requests. We can use it as a header parameter:

    Authorization: {{token}}

### Dataset

Adding a dataset to the registry:

    POST {{url}}/v1/datasets

    { 
        "name": "MyDataset",
        "users": [
            "user_1",
            "user_2"
        ],
        "metadata": [
            { "name" : "meta_1", "value": "value_1" },
            { "name" : "meta_2", "value": "value_2" },
            { "name" : "meta_3", "value": "value_3" }
        ],
        "visibility": "public",
        "tags": [
            "tag_1", 
            "tag_2"
        ]
    }

In creating a new dataset, we have to provide information about the **name** of the dataset, the **visibility** of the dataset (*public* or *private*), the list of **users** who can access the private dataset, the list of **metadata** name-value pairs to describe the dataset, and the list of **tags** to categorize the dataset.

Tags and metadata names are stored by the registry in order to build a folksonomy from the data inserted by users.

After the creation, we receive from the registry a JSON object describing the dataset with a unique **id** that we can use to identify the dataset in subsequent calls.

After we have registered a dataset, we can fetch it using its **id**. We can access only public, owned or shared dataset.

    GET {{url}}/v1/datasets/{{id}}

We can modify the list of **users**, the list of **metadata**, the list of **tags**, and the **visibility**, of a dataset:

    PUT {{url}}/v1/datasets/{{dataset}}

    { 
        "users": {
            "remove": ["user_1", "user_2"],
            "add": ["user_3"]
        },
        "tags": {
            "remove": ["tag_1"],
            "add": ["tag_3"]
        },
        "metadata": {
            "remove": [
                { "name" : "meta_1", "value": "value_1" },
                { "name" : "meta_2", "value": "value_3" }
            ],
            "add": [
                { "name" : "meta_3", "value": "value_7" },
                { "name" : "meta_4", "value": "value_8" }
            ]
        },
        "visibility": "private"
    }

It is possible to search among datasets (public, owned or shared) using a filter:

    GET {{url}}/v1/datasets?filter={"tags":"tag_2"}

as an example, the previous call gets all (public, owned or shared) datasets tagged with with "tag_2" label.

Deleting a datasets:

    DELETE {{url}}/v1/datasets/{{dataset}}

### Model

Adding a model to the registry:

    POST {{url}}/v1/models

    { 
        "name": "MyFirstModel",
        "status": "training",
        "datasets": [
            "dataset_1"
        ],
        "visibility": "public",
        "users": [
            "user_1",
            "user_2"
        ],
        "metadata": [
            { "name" : "meta_1", "value": "value_1" },
            { "name" : "meta_2", "value": "value_2" },
            { "name" : "meta_3", "value": "value_3" }
        ],
        "tags": [
            "tag_1"
        ]
    }

In creating a new model, we have to provide information about the **name** of the model, the current **status** of maturity of the model (*training*, *test*, *production*), the list of **datasets** used to train or test the model, the **visibility** of the model (*public* or *private*), the list of **users** who can access the primvate model, the list of **metadata** name-value pairs to describe the model, and the list of **tags** to categorize the model.

Tags and metadata names are stored by the registry in order to build a folksonomy from the data inserted by users.

After the creation, we receive from the registry a JSON object describing the model with a unique **id** that we can use to identify the model in subsequent calls.

After we have registered an model, we can fetch it using its **id**. We can access only public, owned or shared models.

    GET {{url}}/v1/models/{{id}}

We can modify the list of **users**, the **status**, the list of **metadata**, the list of **tags**, the **visibility**, and the list of **datasets** of a model:

    PUT {{url}}/v1/models/{{model}}

    { 
        "users": {
            "remove": ["user_1", "user_2"],
            "add": ["user_3"]
        },
        "datasets": {
            "remove": ["dataset_1"],
            "add": ["dataset_2"]
        },
        "tags": {
            "remove": ["tag_1"],
            "add": ["tag_2"]
        },
        "status": "deploy",
        "metadata": {
            "remove": [
                { "name" : "meta_1", "value": "value_1" },
                { "name" : "meta_2", "value": "value_3" }
            ],
            "add": [
                { "name" : "meta_3", "value": "value_7" },
                { "name" : "meta_4", "value": "value_8" }
            ]
        },
        "visibility": "private"
    }

It is possible to search among models (public, owned or shared) using a filter:

    GET {{url}}/v1/models?filter={"tags":"tag_2"}

as an example, the previous call gets all (public, owned or shared) models tagged with with "tag_2" label.

Deleting a model:

    DELETE {{url}}/v1/models/{{model}}

### Version

It is possible to add a version (file) to a model or to a dataset:

    POST {{url}}/v1/models/{{model}}/versions
    POST {{url}}/v1/datasets/{{dataste}}/versions

the body should be a form-data with the **file** of type "file" with the file to upload as a version of the model\dataset

Download a version of a model\dataser:

    GET {{url}}/v1/models/{{model}}/versions/{{original}}
    GET {{url}}/v1/datasets/{{dataset}}/versions/{{original}}

where **original** is the name of the file uploaded as a version of the model\dataset

Delete a version

    DELETE {{url}}/v1/models/{{model}}/versions/{{original}}
    DELETE {{url}}/v1/datasets/{{dataset}}/versions/{{original}}

### Tags

The administrator can create a set of default tags that the UI can suggest to the user during model/dataset creation.

    POST {{url}}/v1/tags

    { 
        "_id": "test_tag"
    }

It is possible to get the list of all available default tags:

    GET {{url}}/v1/tags?filter={"usage":"default"}

It is possible to get the list of folk tags:

    GET {{url}}/v1/tags?filter={"usage":"folk"}

It is possible to select tags with a regex expression in order to allow UI auto-completion features:

    GET {{url}}/v1/tags?filter={"_id":{"$regex": "Fol"}}

And also to delete a specific tag (only the administrator):

    DELETE {{url}}/v1/tags/{{tag}}

### Metadata

The administrator can create a set of default metadata names that the UI can suggest to the user during model/dataset creation.

    POST {{url}}/v1/metadata

    { 
        "_id": "test_metadata"
    }

It is possible to get the list of all available default metadata:

    GET {{url}}/v1/metadata?filter={"usage":"default"}

It is possible to get the list of folk metadata:

    GET {{url}}/v1/metadata?filter={"usage":"folk"}

It is possible to select metadata with a regex expression in order to allow UI auto-completion features:

    GET {{url}}/v1/metadata?filter={"_id":{"$regex": "Fol"}}

And also to delete a specific metadata name (only the administrator):

    DELETE {{url}}/v1/metadata/{{metadata}}

### Error

In case of a request with errors, the registry response is filled with a specific **error id**. The list of all possible errors can be accessed as:

    GET {{url}}/v1/errors

Other informations (like registry version, type of environment, etc) can be obtained with the following resources:

    GET {{url}}/v1/info
    GET {{url}}/v1/version

To access the log:

    GET {{url}}/v1/log

## Deploy

The Model Registry is developed using [Node JS](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/). The following steps show how to deploy a complete registry server on a Ubuntu 18.04 server, using Docker. However it can be adapted also for MacOS or Windows operating systems.

[Install Docker](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)
[Install Docker Compose](https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-16-04)

There is a configuration file **\init\variable.env** which can be edited in order to specify several features:

    VERSION=v1
    PROTOCOL=https
    HTTP_PORT=80
    HTTPS_PORT=443
    HTTPSSECRET=atmospherePass
    API_TOKEN=ifhidhfudshuf8
    JWT_SECRET=fdshudshfidsuh
    JWT_EXPIRATIONTIME=300000m
    DATABASE=mongodb://localhost:27017/registry-catalog
    LOG=true
    UPLOAD_PATH=./uploads
    DEFAULT_TENANT=registry-default-tenant
    DEFAULT_TENANT_DATABASE=registry-default
    DEFAULT_TENANT_ADMIN_USERNAME=admin 
    DEFAULT_TENANT_ADMIN_TEMPORARY_PASSWORD=admin 
    DEFAULT_TENANT_PASSWORDHASH=true 

In particular, the connection string with the database and administrator credential (at startup the registry will create a admin user with these credential), the expiration time of tokens, the log level, the secret word for the HTTPS certificate file, the secret word for the JWT token.

Then you can follow the Quick Start instruction to get the Registry.

The Registry can support both HTTP and HTTPS. Without certificate, the registry starts using a self-signed certificate (stored in the resources forlder) or in HTTP (if also the self-signed certificate is missing). It is reccomended to get a valid certificate from a authority. In the following, we provide instruction to add a certificate from [Let's Encript](https://letsencrypt.org/), a free, automated and open Certificate Authority. Detailed instruction can be found at [Certbot instruction](https://certbot.eff.org/instructions)

Install Certbot

    sudo apt-get update
    sudo apt-get install software-properties-common
    sudo add-apt-repository universe
    sudo add-apt-repository ppa:certbot/certbot
    sudo apt-get update
    sudo apt-get install certbot

Use Certbot (modify in order to provide your domain)

    sudo ufw allow 80
    sudo certbot certonly --standalone --preferred-challenges http -d {{url}}

Copy certificates 

    sudo cp /etc/letsencrypt/live/{{url}}/fullchain.pem ~/registry/resources/fullchain.pem
    sudo cp /etc/letsencrypt/live/{{url}}/privkey.pem ~/registry/resources/key.pem

Update certificates

    sudo docker stop registry
    sudo certbot certonly --standalone --preferred-challenges http -d {{url}}
    sudo cp /etc/letsencrypt/live/{{url}}/fullchain.pem ~/registry/resources/fullchain.pem
    sudo cp /etc/letsencrypt/live/{{url}}/privkey.pem ~/registry/resources/privkey.pem

Finally update the Registry image.
