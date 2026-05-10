import type { ImportAction as Action, ImportState as State } from "./types";

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
