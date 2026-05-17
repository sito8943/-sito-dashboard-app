import type { ImportPreviewDto } from "lib";

import type {
  ImportAction as Action,
  ImportPreviewStatusCounts,
  ImportState as State,
} from "./types";

export const computeImportPreviewCounts = <T extends ImportPreviewDto>(
  items: T[],
): ImportPreviewStatusCounts =>
  items.reduce<ImportPreviewStatusCounts>(
    (acc, item) => ({
      existing: acc.existing + (item.existing ? 1 : 0),
      willCreate: acc.willCreate + (item.willCreate ? 1 : 0),
      conflict: acc.conflict + (item.conflict ? 1 : 0),
    }),
    { existing: 0, willCreate: 0, conflict: 0 },
  );

export const initialState = <T>(): State<T> => ({
  file: null,
  previewItems: null,
  parseError: null,
  processing: false,
  overrideExisting: false,
  inputKey: 0,
});

export const reducer = <T>(state: State<T>, action: Action<T>): State<T> => {
  switch (action.type) {
    case "SET_FILE":
      return {
        ...state,
        file: action.file,
        previewItems: null,
        parseError: null,
        processing: false,
      };
    case "START_PROCESSING":
      return { ...state, processing: true };
    case "SET_PREVIEW":
      return {
        ...state,
        previewItems: action.items,
        parseError: null,
        processing: false,
      };
    case "SET_ERROR":
      return {
        ...state,
        previewItems: null,
        parseError: action.message,
        processing: false,
      };
    case "SET_OVERRIDE":
      return { ...state, overrideExisting: action.value };
    case "RESET":
      return { ...initialState<T>(), inputKey: state.inputKey + 1 };
  }
};
