import { extractPages } from "./functions/extractPages.js";
import { impose } from "./functions/impose.js";
import { mergePDFs } from "./functions/mergePDFs.js";
import { rotatePages } from "./functions/rotatePDF.js";
import { splitPDF } from "./functions/splitPDF.js";
import { organizeWaitOperations } from "./organizeWaitOperations.js";

export async function traverseOperations(operations, input) {
    const waitOperations = organizeWaitOperations(operations);
    const results = [];
    await nextOperation(operations, input);
    return results;

    async function nextOperation(operations, input) {
        if(Array.isArray(operations) && operations.length == 0) { // isEmpty
            console.log("operation done: " + input.fileName);
            results.push(input);
            return;
        }
    
        for (let i = 0; i < operations.length; i++) {
            await computeOperation(operations[i], structuredClone(input)); // break references
        }
    }
    
    async function computeOperation(operation, input) {
        switch (operation.type) {
            case "done":
                console.log("Done operation will get called if all waits are done. Skipping for now.")
                break;
            case "wait":
                const waitOperation = waitOperations[operation.values.id];
                waitOperation.input.push(input);
                waitOperation.waitCount--;
                if(waitOperation.waitCount == 0) {
                    await nextOperation(waitOperation.doneOperation.operations, waitOperation.input);
                }
                break;
            case "removeObjects":
                console.warn("RemoveObjects not implemented yet.")

                if(Array.isArray(input)) {
                    for (let i = 0; i < input.length; i++) {
                        // TODO: modfiy input
                        input[i].fileName += "_removedObjects";
                        await nextOperation(operation.operations, input[i]);
                    }
                }
                else {
                    // TODO: modfiy input
                    input.fileName += "_removedObjects";
                    await nextOperation(operation.operations, input);
                }
                break;
            case "extract":
                if(Array.isArray(input)) {
                    for (let i = 0; i < input.length; i++) {
                        input[i].fileName += "_extractedPages";
                        input[i].buffer = await extractPages(input[i].buffer, operation.values["pagesToExtractArray"]);
                        await nextOperation(operation.operations, input[i]);
                    }
                }
                else {
                    input.fileName += "_extractedPages";
                    input.buffer = await extractPages(input.buffer, operation.values["pagesToExtractArray"]);
                    await nextOperation(operation.operations, input);
                }
                break;
            case "split":
                // TODO: When a split goes into a wait function it might break the done condition, as it will count multiplpe times.
                if(Array.isArray(input)) {
                    for (let i = 0; i < input.length; i++) {
                        const splits = await splitPDF(input[i].buffer, operation.values["pagesToSplitAfterArray"]);

                        for (let j = 0; j < splits.length; j++) {
                            const split = {};
                            split.originalFileName = input[i].originalFileName;
                            split.fileName = input[i].fileName + "_split";
                            split.buffer = splits[j];
                            await nextOperation(operation.operations, split);
                        }
                    }
                }
                else {
                    const splits = await splitPDF(input.buffer, operation.values["pagesToSplitAfterArray"]);

                    for (let j = 0; j < splits.length; j++) {
                        const split = {};
                        split.originalFileName = input.originalFileName;
                        split.fileName = input.fileName + "_split";
                        split.buffer = splits[j];
                        await nextOperation(operation.operations, split);
                    }
                }
                break;
            case "fillField":
                console.warn("FillField not implemented yet.")

                if(Array.isArray(input)) {
                    for (let i = 0; i < input.length; i++) {
                        // TODO: modfiy input
                        input[i].fileName += "_filledField";
                        await nextOperation(operation.operations, input[i]);
                    }
                }
                else {
                    // TODO: modfiy input
                    input.fileName += "_filledField";
                    await nextOperation(operation.operations, input);
                }
                break;
            case "extractImages":
                console.warn("ExtractImages not implemented yet.")

                if(Array.isArray(input)) {
                    for (let i = 0; i < input.length; i++) {
                        // TODO: modfiy input
                        input[i].fileName += "_extractedImages";
                        await nextOperation(operation.operations, input[i]);
                    }
                }
                else {
                    // TODO: modfiy input
                    input.fileName += "_extractedImages";
                    await nextOperation(operation.operations, input);
                }
                break;
            case "merge":
                if(Array.isArray(input) && input.length > 1) {
                    const inputs = input;
                    input = {
                        originalFileName: inputs.map(input => input.originalFileName).join("_and_"),
                        fileName: inputs.map(input => input.fileName).join("_and_") + "_merged",
                        buffer: await mergePDFs(inputs.map(input => input.buffer))
                    }
                }
                else {
                    // Only one input, no need to merge
                    input.fileName += "_merged";
                }
                await nextOperation(operation.operations, input);
                break;
            case "transform": {
                console.warn("Transform not implemented yet.")
                if(Array.isArray(input)) {
                    for (let i = 0; i < input.length; i++) {
                        // TODO: modfiy input
                        input[i].fileName += "_transformed";
                        await nextOperation(operation.operations, input[i]);
                    }
                }
                else {
                    // TODO: modfiy input
                    input.fileName += "_transformed";
                    await nextOperation(operation.operations, input);
                }
                break;
            }
            case "extract":
                if(Array.isArray(input)) {
                    for (let i = 0; i < input.length; i++) {
                        input[i].fileName += "_extractedPages";
                        input[i].buffer = await extractPages(input[i].buffer, operation.values["pagesToExtractArray"]);
                        await nextOperation(operation.operations, input[i]);
                    }
                }
                else {
                    input.fileName += "_extractedPages";
                    input.buffer = await extractPages(input.buffer, operation.values["pagesToExtractArray"]);
                    await nextOperation(operation.operations, input);
                }
                break;
            case "rotate":
                if(Array.isArray(input)) {
                    for (let i = 0; i < input.length; i++) {
                        input[i].fileName += "_turned";
                        input[i].buffer = await rotatePages(input[i].buffer, operation.values["rotation"]);
                        await nextOperation(operation.operations, input[i]);
                    }
                }
                else {
                    input.fileName += "_turned";
                    input.buffer = await rotatePages(input.buffer, operation.values["rotation"]);
                    await nextOperation(operation.operations, input);
                }
                break;
            case "impose":
                if(Array.isArray(input)) {
                    for (let i = 0; i < input.length; i++) {
                        input[i].fileName += "_imposed";
                        input[i].buffer = await impose(input[i].buffer, operation.values["nup"], operation.values["format"]);
                        await nextOperation(operation.operations, input[i]);
                    }
                }
                else {
                    input.fileName += "_imposed";
                    input.buffer = await impose(input.buffer, operation.values["nup"], operation.values["format"]);
                    await nextOperation(operation.operations, input);
                }
                break;
            default:
                console.log("operation type unknown: ", operation.type);
                break;
        }
    }
}