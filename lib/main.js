if(typeof window !== 'undefined' && window !== null) {
  // window is for some reason defined in React Native, but throws an exception when you try to set to it
  try {
    window.Note = Note;
    window.Tag = Tag;
    window.Mfa = Mfa;
    window.ServerExtension = ServerExtension;
    window.Component = Component;
    window.Editor = Editor;
    window.Extension = Extension;
    window.Theme = Theme;
    window.EncryptedStorage = EncryptedStorage;
  } catch (e) {
    console.log("Exception while exporting window variables", e);
  }
}
