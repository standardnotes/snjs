export class SFAlertManager {

  async alert(params) {
    return new Promise((resolve, reject) => {
      window.alert(params.text);
      resolve();
    })
  }

  async confirm(params) {
    return new Promise((resolve, reject) => {
      if(window.confirm(params.text)) {
        resolve();
      } else {
        reject();
      }
    });
  }

}
