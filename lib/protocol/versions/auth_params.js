export class SNAuthParams {
  constructor(content)  {
    this.content = content;
    Object.assign(this, content);
  }
}
