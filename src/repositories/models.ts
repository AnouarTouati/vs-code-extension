import { repository } from ".";
import { Eloquent } from "..";
import { writeEloquentDocBlocks } from "../support/docblocks";
import { runInLaravel, template } from "./../support/php";

const modelPaths = ["app", "app/Models"];

const load = () => {
    return runInLaravel<Eloquent.Models>(
        template("eloquentProvider", {
            model_paths: JSON.stringify(modelPaths),
        }),
        "Eloquent Attributes and Relations",
    ).then((models) => {
        writeEloquentDocBlocks(models);

        return models;
    });
};

export const getModels = repository<Eloquent.Models>(
    load,
    modelPaths.concat(["database/migrations"]).map((path) => `${path}/*.php`),
    {},
);
