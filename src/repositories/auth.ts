import { repository } from ".";
import { runInLaravel, template } from "./../support/php";

interface AuthItems {
    [key: string]: AuthItem[];
}

interface AuthItem {
    key: string;
    model_class: string | null;
    policy_class: string | null;
    uri: string;
    lineNumber: number;
}

const load = () => {
    return runInLaravel<AuthItems>(template("auth"), "Auth Data");
};

export const getRegisteredAbilitiesInLaravelProject = repository<AuthItems>(
    load,
    ["app/Providers/{,*,**/*}.php","app/Policies/**.php"],
    {},
);
