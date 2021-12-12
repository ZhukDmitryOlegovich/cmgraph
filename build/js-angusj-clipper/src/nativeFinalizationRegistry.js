export const nativeFinalizationRegistry = typeof FinalizationRegistry === "undefined" ? undefined : new FinalizationRegistry((nativeObj) => {
    if (!nativeObj.isDeleted()) {
        nativeObj.delete();
    }
});
