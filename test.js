import * as aesjs from "https://cdn.skypack.dev/aes-js@3.1.2";
async function encrypt(object) {
  const key = "uEKBcN7kMKayW6SF8d0BtaJq60Musbp0";
  const keyBlob = await new Blob([key]).arrayBuffer().then(res => new Uint8Array(res)).then(res => Array.from(res));
  
  const iv = "hA7wB3e4v87ihj6R";
  const ivBlob = await new Blob([iv]).arrayBuffer().then(res => new Uint16Array(res)).then(res => Array.from(res));
  
  const aesCBC = new aesjs.ModeOfOperation.cbc(keyBlob, ivBlob);
  
  function encryptObjectValues (obj) {
    return Object.fromEntries(Object.entries(obj).map(function ([key, value]) {
      const textToBytes = aesjs.utils.utf8.toBytes(value)
      const encryptedText = aesCBC.encrypt(textToBytes);
      return [key, encryptedText];
    }));
  }
  
  return encryptObjectValues(object);
}

encrypt({ name: "Ridwan", surname: "Olanrewaju" }).then(res => {
  console.log(res)
});

console.log("hello")
