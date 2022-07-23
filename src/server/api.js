// Simple Express server setup to serve for local testing/dev API server
const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const jsforce = require('jsforce');
require('dotenv').config();
const { SF_USERNAME, SF_PASSWORD, SF_TOKEN, SF_LOGIN_URL } = process.env;
if (!(SF_USERNAME && SF_PASSWORD && SF_TOKEN && SF_LOGIN_URL)) {
    console.error(
        'Cannot start app: missing mandatory configuration. Check your .env file.'
    );
    process.exit(-1);
}
const conn = new jsforce.Connection({
    loginUrl: SF_LOGIN_URL
});
conn.login(SF_USERNAME, SF_PASSWORD + SF_TOKEN, err => {
    if (err) {
        console.error(err);
        process.exit(-1);
    }
});
const app = express();
app.use(helmet());
app.use(compression());

const HOST = process.env.API_HOST || 'localhost';
const PORT = process.env.API_PORT || 3002;

app.get('/api/accounts', (req, res) => {
    console.log('hiii');
    const soql = `SELECT Id, Name, Website, Industry from Account`;
    conn.query(soql, (err, result) => {
        if (err) {
            res.sendStatus(500);
        } else if (result.records.length === 0) {
            res.status(404).send('Session not found.');
        } else {
            console.log('IN response');
            const formattedData = result.records;
            res.send({ data: formattedData });
        }
    });
});

app.get('/api/createobject', (req, res) => {
    //Creating object
    console.log('Object Creation begin...');
    var metadata = [{
        fullName: 'alex__c',
        label: 'alex',
        pluralLabel: 'alexs',
        nameField: {
            type: 'AutoNumber',
            label: 'alex'
        },
        fields: [
            {
                fullName: 'test__c',
                externalId: 'false',
                label: 'Test',
                required: 'false',
                trackTrending: 'false',
                type: 'Text',
                length: '255',
                unique: 'false'
            },

            {
                fullName: 'company__c',
                externalId: 'false',
                label: 'company',
                required: 'false',
                length: '255',
                trackTrending: 'false',
                type: 'Text',
                unique: 'false'
            }
        ],
        deploymentStatus: 'InDevelopment',
        sharingModel: 'Private'
    }];
    conn.metadata.create('CustomObject', metadata, function (err, results) {
        if (err) { console.err(err); }
        console.log('in api resp:' + results.length);
        res.send({ data: results.length });
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            console.log('success ? : ' + result.success);
            console.log('fullName : ' + result.fullName);
        }
    });
    //Creating Class for updating layout
    var apexBody = [
        "public class updatelayoutclass {",
        "public class UpdatePageLayoutsmc {public Metadata.Layout buildLayout() {List<Metadata.Metadata> layouts = Metadata.Operations.retrieve(Metadata.MetadataType.Layout, ",
        "new List<String> {'alex__c-alex Layout'});",
        "Metadata.Layout layoutMd = (Metadata.Layout) layouts.get(0);",
        "Metadata.LayoutSection layoutSectionToEdit = null;",
        "List<Metadata.LayoutSection> layoutSections = layoutMd.layoutSections;",
        "for (Metadata.LayoutSection section : layoutSections) {",
        "if (section.label == 'Information') {",
        "layoutSectionToEdit = section;",
        "break;",
        "}}",

        "List<Metadata.LayoutColumn> layoutColumns = layoutSectionToEdit.layoutColumns;",
        " List<Metadata.LayoutItem> layoutItems = layoutColumns.get(0).layoutItems;",
        "Metadata.LayoutItem item1 = new Metadata.LayoutItem();",
        "item1.behavior = Metadata.UiBehavior.Edit;",
        "item1.field = 'Product__c';",
        "layoutItems.add(item1);",
        "Metadata.LayoutItem item2 = new Metadata.LayoutItem();",
        "item2.behavior = Metadata.UiBehavior.Edit;",
        "item2.field = 'qa_field__c';",
        "layoutItems.add(item2);",
        "return layoutMd;",
        "}",
        "}",
        "public class PostInstallCallbacksmc implements Metadata.DeployCallback {",
        "public void handleResult(Metadata.DeployResult result,",
        "Metadata.DeployCallbackContext context) {",
        "if (result.status == Metadata.DeployStatus.Succeeded) {",
        "System.debug('Deployment Succeeded!');",
        "} else {System.debug('Deployment Failed!');}}}",
        "public class DeployMetadatasmc {",
        "public Metadata.DeployContainer constructDeploymentRequest() {",
        "Metadata.DeployContainer container = new Metadata.DeployContainer();",
        "Metadata.Layout layoutMetadata = new updatelayoutclass.UpdatePageLayoutsmc().buildLayout();",
        "container.addMetadata(layoutMetadata);",
        "return container;}",
        "public void deploy(Metadata.DeployContainer container) {",
        "updatelayoutclass.PostInstallCallbacksmc callback = new updatelayoutclass.PostInstallCallbacksmc();",
        "Id asyncResultId = Metadata.Operations.enqueueDeployment(container, callback);}}",
        "}"
    ].join('\n');
    conn.tooling.sobject('ApexClass').create({
        body: apexBody
    }, function (err, res) {
        if (err) { return console.error(err); }
        console.log(res);
    });
});

app.get('/api/createtab', (req, res) => {
    //Creating Tab
    console.log('Create Tab');
    var tabdata = {
        customObject: true,
        fullName: 'alex__c',
        motif: 'Custom70: Handsaw'

    }
    conn.metadata.create('CustomTab', tabdata, function (err, results) {
        if (err) { console.err(err); }
        console.log('in api resp:' + Object.keys(results));
        console.log('in api result:' + results.success);
        res.send({ data: results.length });
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            console.log('success ? : ' + result.success);
            console.log('fullName : ' + result.fullName);
        }
    });

});

app.get('/api/assignperm', (req, res) => {
    //Updating Page Layout
    console.log('Updating Page Layout');

    var apexBody3 = "updatelayoutclass.DeployMetadatasmc deployUtil = new updatelayoutclass.DeployMetadatasmc();Metadata.DeployContainer container = deployUtil.constructDeploymentRequest();deployUtil.deploy(container);";
    conn.tooling.executeAnonymous(apexBody3, function (err, res) {
        if (err) { return console.error(err); }
        console.log("compiled?: " + res.compiled); // compiled successfully
        console.log("executed?: " + res.success); // executed successfully
        // ...
    });

    //Assign permission to profile for fields & tabs
    console.log('Assign Permissions');
    conn.metadata.update('Profile', [{
        fullName: 'Admin',
        fieldPermissions: [{ field: 'alex__c.company__c', editable: true, readable: true },
        { field: 'alex__c.test__c', editable: true, readable: true }],
        tabVisibilities: [{ tab: 'alex__c', visibility: 'DefaultOn' }]
    }], function (error, firstResults) {
        if (error) {
            return console.error(error);
        }
        console.log(firstResults);
        console.log('Done');
    });
});



app.listen(PORT, () =>
    console.log(
        `✅  API Server started: http://${HOST}:${PORT}/api/v1/endpoint`
    )
);
