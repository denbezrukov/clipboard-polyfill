import { StringItem } from "../ClipboardItem/convert";
import { TEXT_PLAIN } from "../ClipboardItem/data-types";
import { debugLog } from "../debug";
import {
  originalNavigatorClipboardReadText,
  originalNavigatorClipboardWriteText,
  promiseConstructor,
} from "../builtin-globals";
import { readTextIE, seemToBeInIE } from "../strategies/internet-explorer";
import { writeFallback } from "./write-fallback";
import { rejectThrownErrors } from "../promise/promise-compat";

function stringToStringItem(s: string): StringItem {
  var stringItem: StringItem = {};
  stringItem[TEXT_PLAIN] = s;
  return stringItem;
}

export function writeText(s: string): Promise<void> {
  return rejectThrownErrors(() => {
    // Use the browser implementation if it exists.
    if (originalNavigatorClipboardWriteText) {
      debugLog("Using `navigator.clipboard.writeText()`.");
      return originalNavigatorClipboardWriteText(s).catch(
        writeTextStringFallback,
      );
    }
    return promiseConstructor.resolve(writeTextStringFallback(s));
  });
}

function writeTextStringFallback(s: string): void {
  if (!writeFallback(stringToStringItem(s))) {
    throw new Error("writeText() failed");
  }
}

export function readText(): Promise<string> {
  return rejectThrownErrors(() => {
    // Use the browser implementation if it exists.
    if (originalNavigatorClipboardReadText) {
      debugLog("Using `navigator.clipboard.readText()`.");
      return originalNavigatorClipboardReadText();
    }

    // Fallback for IE.
    if (seemToBeInIE()) {
      debugLog("Reading text using IE strategy.");
      console.log("fooly");
      var result = readTextIE();
      console.log(result);
      return promiseConstructor.resolve(result);
    }

    throw new Error("Read is not supported in your browser.");
  });
}
