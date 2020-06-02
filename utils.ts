function utf8_to_str(a) {
    for(var i=0, s=''; i<a.length; i++) {
        var h = a[i].toString(16)
        if(h.length < 2) h = '0' + h
        s += '%' + h
    }
    return decodeURIComponent(s)
}

function utf8_from_str(s) {
    for(var i=0, enc = encodeURIComponent(s), a = []; i < enc.length;) {
        if(enc[i] === '%') {
            a.push(parseInt(enc.substr(i+1, 2), 16))
            i += 3
        } else {
            a.push(enc.charCodeAt(i++))
        }
    }
    return a
}

// Most of the function / data structure here are being taken from
// the Excalidraw project https://github.com/excalidraw/excalidraw/blob/master/src/data/index.ts

export type EncryptedData = {
  data: ArrayBuffer;
  iv: Uint8Array;
};

const createIV = () => {
  const arr = new Uint8Array(12);
  return window.crypto.getRandomValues(arr);
};

const getImportedKey = (key: string, usage: KeyUsage) =>
  window.crypto.subtle.importKey(
    "jwk",
    {
      alg: "A128GCM",
      ext: true,
      k: key,
      key_ops: ["encrypt", "decrypt"],
      kty: "oct",
    },
    {
      name: "AES-GCM",
      length: 128,
    },
    false, // extractable
    [usage],
  );

export const encryptAESGEM = async (
  data: Uint8Array,
  key: string,
): Promise<EncryptedData> => {
  const importedKey = await getImportedKey(key, "encrypt");
  const iv = createIV();
  return {
    data: await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      importedKey,
      data,
    ),
    iv,
  };
};

export const decryptAESGEM = async (
  data: ArrayBuffer,
  key: string,
  iv: Uint8Array,
): Promise<any> => {
  try {
    const importedKey = await getImportedKey(key, "decrypt");
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      importedKey,
      data,
    );

    const decodedData = new TextDecoder("utf-8").decode(
      new Uint8Array(decrypted) as any,
    );
    return JSON.parse(decodedData);
  } catch (error) {
    console.error(error);
  }
  return {
    type: "INVALID_RESPONSE",
  };
};

export const encryptDataForSaving = async (content: string) => {
  const encoded = new Uint8Array(utf8_from_str(content)).buffer;

  const key = await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 128,
    },
    true, // extractable
    ["encrypt", "decrypt"],
  );
  // The iv is set to 0. We are never going to reuse the same key so we don't
  // need to have an iv. (I hope that's correct...)
  const iv = new Uint8Array(12);
  // We use symmetric encryption. AES-GCM is the recommended algorithm and
  // includes checks that the ciphertext has not been modified by an attacker.
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoded,
  );
  // We use jwk encoding to be able to extract just the base64 encoded key.
  // We will hardcode the rest of the attributes when importing back the key.
  const exportedKey = await window.crypto.subtle.exportKey("jwk", key);

  return { data: encrypted, key: exportedKey.k! };
};


export const decryptDataForLoading = async (
  content: ArrayBuffer,
  privateKey: string
) => {
  const buffer = content;
  const key = await getImportedKey(privateKey, "decrypt");
  const iv = new Uint8Array(12);
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    buffer,
  );
  return utf8_to_str(new Uint8Array(decrypted));
};

export function debounce(func, wait, immediate) {
  var timeout;

  // This is the function that is actually executed when
  // the DOM event is triggered.
  return function executedFunction() {
    // Store the context of this and any
    // parameters passed to executedFunction
    var context = this;
    var args = arguments;

    // The function to be called after
    // the debounce time has elapsed
    var later = function() {
      // null timeout to indicate the debounce ended
      timeout = null;

      // Call function now if you did not on the leading end
      if (!immediate) func.apply(context, args);
    };

    // Determine if you should call the function
    // on the leading or trail end
    var callNow = immediate && !timeout;

    // This will reset the waiting every function execution.
    // This is the step that prevents the function from
    // being executed because it will never reach the
    // inside of the previous setTimeout
    clearTimeout(timeout);

    // Restart the debounce waiting period.
    // setTimeout returns a truthy value (it differs in web vs node)
    timeout = setTimeout(later, wait);

    // Call immediately if you're dong a leading
    // end execution
    if (callNow) func.apply(context, args);
  };
};