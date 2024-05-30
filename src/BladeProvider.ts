"use strict";

import * as vscode from "vscode";
import Helpers from "./helpers";
import { runInLaravel, template } from "./PHP";

export default class BladeProvider implements vscode.CompletionItemProvider {
    private customDirectives: Array<any> = [];

    constructor() {
        this.loadCustomDirectives();

        // TODO: huh?
        // setInterval(() => this.loadCustomDirectives(), 600000);
    }

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext,
    ): Array<vscode.CompletionItem> {
        let isBlade =
            document.languageId == "blade" ||
            document.languageId == "laravel-blade" ||
            document.fileName.endsWith(".blade.php");
        if (
            vscode.workspace
                .getConfiguration("Laravel")
                .get<boolean>("disableBlade", false) ||
            isBlade === false
        ) {
            return [];
        }
        var out: Array<vscode.CompletionItem> = this.getDefaultDirectives(
            document,
            position,
        );

        for (var i in this.customDirectives) {
            var completeItem = new vscode.CompletionItem(
                "@" +
                    this.customDirectives[i].name +
                    (this.customDirectives[i].hasParams ? "(...)" : ""),
                vscode.CompletionItemKind.Keyword,
            );
            completeItem.insertText = new vscode.SnippetString(
                "@" +
                    this.customDirectives[i].name +
                    (this.customDirectives[i].hasParams ? "(${1})" : ""),
            );
            completeItem.range = document.getWordRangeAtPosition(
                position,
                Helpers.wordMatchRegex,
            );
            out.push(completeItem);
        }
        return out;
    }

    loadCustomDirectives() {
        runInLaravel(template("blade-directives"), "Custom Blade Directives")
            .then((result) => {
                if (result) {
                    this.customDirectives = JSON.parse(result);
                }
            })
            .catch((exception) => {
                console.error(exception);
            });
    }

    getDefaultDirectives(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): Array<vscode.CompletionItem> {
        let out: vscode.CompletionItem[] = [];

        const directives = this.defaultDirectives();

        for (let key in directives) {
            var completeItem = new vscode.CompletionItem(
                key,
                vscode.CompletionItemKind.Keyword,
            );

            const value = directives[key];

            completeItem.insertText = new vscode.SnippetString(
                typeof value === "string" ? value : value.join("\n"),
            );

            completeItem.range = document.getWordRangeAtPosition(
                position,
                Helpers.wordMatchRegex,
            );

            out.push(completeItem);
        }

        return out;
    }

    defaultDirectives(): { [key: string]: string | string[] } {
        return {
            "@if(...)": ["@if (${1})", Helpers.indent("${2}"), "@endif"],
            "@error(...)": [
                "@error(${1})",
                Helpers.indent("${2}"),
                "@enderror",
            ],
            "@if(...) ... @else ... @endif": [
                "@if (${1})",
                Helpers.indent("${2}"),
                "@else",
                Helpers.indent("${3}"),
                "@endif",
            ],
            "@foreach(...)": [
                "@foreach (${1} as ${2})",
                Helpers.indent("${3}"),
                "@endforeach",
            ],
            "@forelse(...)": [
                "@forelse (${1} as ${2})",
                Helpers.indent("${3}"),
                "@empty",
                Helpers.indent("${4}"),
                "@endforelse",
            ],
            "@for(...)": ["@for (${1})", Helpers.indent("${2}"), "@endfor"],
            "@while(...)": [
                "@while (${1})",
                Helpers.indent("${2}"),
                "@endwhile",
            ],
            "@switch(...)": [
                "@switch(${1})",
                Helpers.indent("@case(${2})"),
                Helpers.indent("${3}", 2),
                Helpers.indent("@break", 2),
                "",
                Helpers.indent("@default"),
                Helpers.indent("${4}", 2),
                "@endswitch",
            ],
            "@case(...)": ["@case(${1})", Helpers.indent("${2}"), "@break"],
            "@break": "@break",
            "@continue": "@continue",
            "@break(...)": "@break(${1})",
            "@continue(...)": "@continue(${1})",
            "@default": "@default",
            "@extends(...)": "@extends(${1})",
            "@empty": "@empty",
            "@verbatim ...": [
                "@verbatim",
                Helpers.indent("${1}"),
                "@endverbatim",
            ],
            "@json(...)": "@json(${1})",
            "@elseif (...)": "@elseif (${1})",
            "@else": "@else",
            "@unless(...)": [
                "@unless (${1})",
                Helpers.indent("${2}"),
                "@endunless",
            ],
            "@isset(...)": [
                "@isset(${1})",
                Helpers.indent("${2}"),
                "@endisset",
            ],
            "@empty(...)": [
                "@empty(${1})",
                Helpers.indent("${2}"),
                "@endempty",
            ],
            "@auth": ["@auth", Helpers.indent("${1}"), "@endauth"],
            "@guest": ["@guest", Helpers.indent("${1}"), "@endguest"],
            "@auth(...)": ["@auth(${1})", Helpers.indent("${2}"), "@endauth"],
            "@guest(...)": [
                "@guest(${1})",
                Helpers.indent("${2}"),
                "@endguest",
            ],
            "@can(...)": ["@can(${1})", Helpers.indent("${2}"), "@endcan"],
            "@cannot(...)": [
                "@cannot(${1})",
                Helpers.indent("${2}"),
                "@endcannot",
            ],
            "@elsecan(...)": "@elsecan(${1})",
            "@elsecannot(...)": "@elsecannot(${1})",
            "@production": [
                "@production",
                Helpers.indent("${1}"),
                "@endproduction",
            ],
            "@env(...)": ["@env(${1})", Helpers.indent("${2}"), "@endenv"],
            "@hasSection(...)": [
                "@hasSection(${1})",
                Helpers.indent("${2}"),
                "@endif",
            ],
            "@sectionMissing(...)": ["@sectionMissing(${1})", "${2}", "@endif"],
            "@include(...)": "@include(${1})",
            "@includeIf(...)": "@includeIf(${1})",
            "@includeWhen(...)": "@includeWhen(${1}, ${2})",
            "@includeUnless(...)": "@includeUnless(${1}, ${2})",
            "@includeFirst(...)": "@includeFirst(${1})",
            "@each(...)": "@each(${1}, ${2}, ${3})",
            "@once": ["@once", Helpers.indent("${1}"), "@endonce"],
            "@yield(...)": "@yield(${1})",
            "@slot(...)": "@slot(${1})",
            "@stack(...)": "@stack(${1})",
            "@push(...)": ["@push(${1})", Helpers.indent("${2}"), "@endpush"],
            "@prepend(...)": [
                "@prepend(${1})",
                Helpers.indent("${2}"),
                "@endprepend",
            ],
            "@php": ["@php", Helpers.indent("${1}"), "@endphp"],
            "@component(...)": ["@component(${1})", "${2}", "@endcomponent"],
            "@section(...) ... @endsection": [
                "@section(${1})",
                "${2}",
                "@endsection",
            ],
            "@section(...)": "@section(${1})",
            "@props(...)": "@props(${1})",
            "@show": "@show",
            "@stop": "@stop",
            "@parent": "@parent",
            "@csrf": "@csrf",
            "@method(...)": "@method(${1})",
            "@inject(...)": "@inject(${1}, ${2})",
            "@dump(...)": "@dump(${1})",
            "@dd(...)": "@dd(${1})",
            "@lang(...)": "@lang(${1})",
            "@endif": "@endif",
            "@enderror": "@enderror",
            "@endforeach": "@endforeach",
            "@endforelse": "@endforelse",
            "@endfor": "@endfor",
            "@endwhile": "@endwhile",
            "@endswitch": "@endswitch",
            "@endverbatim": "@endverbatim",
            "@endunless": "@endunless",
            "@endisset": "@endisset",
            "@endempty": "@endempty",
            "@endauth": "@endauth",
            "@endguest": "@endguest",
            "@endproduction": "@endproduction",
            "@endenv": "@endenv",
            "@endonce": "@endonce",
            "@endpush": "@endpush",
            "@endprepend": "@endprepend",
            "@endphp": "@endphp",
            "@endcomponent": "@endcomponent",
            "@endsection": "@endsection",
            "@endslot": "@endslot",
            "@endcan": "@endcan",
            "@endcannot": "@endcannot",
        };
    }
}