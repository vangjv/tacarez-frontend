## TacarEZ

## Introduction

This application provides a user experience to help map data using ArcGIS javascript API.  There is also an approval workflow built in that lets users save changes and send them to stakeholders for approval.  Behind the scenes the map data is being version controlled in a public Github repository.  To see the features in Github, visit: https://github.com/dshackathon?tab=repositories.  From there you can explore the commit history and even look at recent instances of the map.  Github has an integration where it displays visually the geojson map data.  In the future, we would like to be able to explore exposing and loading previous commit data as history and display the commit notes.  It would be great to build a timeline to see the changes to a map over time.

## Technologies

The architecture for this application follows a microservice approach. These microservices are hosted in Azure using Azure functions. This allowed for flexibility in deployments. The front end is built on Angular with the component library PrimeNG.  A CI/CD pipeline was built using Github actions to deploy the build Angular code to an Azure Static Website.

The backend consist of multiple API:

The main API which exposes the database and connects the other micro services:
https://github.com/vangjv/tacarez-api

The DocusignAPI Service (used for all things DocuSign and handles DocuSign auth):
https://github.com/vangjv/tacarez-docusignapi

A Docusign Webhook Service which handles envelope events from DocuSign:
https://github.com/vangjv/tacarez-docusign-webhook

The GithubAPI (used to create, read, update, merge repos)
https://github.com/vangjv/tacarez-githubapi

The database for this application is a NoSQL database hosted with Azure CosmosDB

## Installation

This application can be cloned via this git repository.  

`git clone https://github.com/vangjv/tacarez-frontend/`

From the command line, run 
npm install

After the packages are installed, run 
ng serve -o

The application will be served locally at http://localhost:4200

## Credits

Jonathan Vang
Touger Thao
Dan Chang
Khumor Chang
Jesse Vang

## License

This project is MIT Licensed
