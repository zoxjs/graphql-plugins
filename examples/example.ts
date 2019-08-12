import * as fs from "fs";
import * as path from "path";
import {PluginDiscovery} from "zox-plugins";
import {testList} from "./TestQueries";
import {assembleSchema} from "../lib/assembleSchema";
import {graphql, introspectionQuery} from "graphql";

(async function example() {

    const pluginDiscovery = new PluginDiscovery();

    await pluginDiscovery.scanProject();
    await pluginDiscovery.scanDirectory(path.join(__dirname, 'Plugins'));

    const schemaInfo = assembleSchema(pluginDiscovery);

    // fs.writeFileSync(path.join(__dirname, 'schema.graphqls'), schemaInfo.typeDefs);

    const data = await graphql(schemaInfo.schema, introspectionQuery);

    fs.writeFileSync(path.join(__dirname, 'graphql.schema.json'), JSON.stringify(data));

    testList(schemaInfo.schema);

})();
