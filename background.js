const AIRTABLE_API_KEY = "keykwFOW0XYMu6DZ9";
const AIRTABLE_BASE_ID = "app85ZpELdKccgZeg";
const AIRTABLE_TABLE_NAME = encodeURIComponent("data");


chrome.runtime.onInstalled.addListener(() => {
  updateContextMenu();
});


function createContextMenus() {
  chrome.contextMenus.create({
    id: "addToAvaText",
    title: "Add summary to Ava",
    contexts: ["page"],
  });
  chrome.contextMenus.create({
    id: "addToAvaImage",
    title: "Add image to Ava",
    contexts: ["image"],
  });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.user_uid) {
    updateContextMenu();
  }
});



function updateContextMenu() {
  chrome.storage.local.get("user_uid", (result) => {
    if (result.user_uid) {
      createContextMenus();
    } else {
      chrome.contextMenus.removeAll();
    }
  });
}




chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addToAvaImage") {
    const imageUrl = info.srcUrl;
    console.log("Add to Ava clicked! Image URL:", imageUrl);
    sendImageUrlToAirtable(imageUrl);
  } else if (info.menuItemId === "addToAvaText") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  }
});

// ... The rest of the code remains the same ...





let summary; // Add this line to store the received summary

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("hi")
  console.log(message.summary)
  if (message.summary) {
    summary = message.summary;
    sendSummaryToAirtable(summary); 
    summary = null;
  }
});


async function sendSummaryToAirtable(summary) {
  chrome.storage.local.get('auth_token', async (result) => {
    const auth_token = result.auth_token;

    const imageID = await fetch("https://ava-backend-0jva.onrender.com/add_summary", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        authId: auth_token, 
        summary: summary
      })
    });
    console.log(imageID.json());
    
    // if (!uid) {
    //   console.error("UID not found in local storage");
    //   updateContextMenu(); // Add this line
    //   return;
    // }

    // console.log("Here's the summary"+ summary)

    // const existingRecord = await getRecordByUid(uid);

    // if (existingRecord) {
    //   await updateRecord(existingRecord.id, null, summary);
    // } else {
    //   await createRecord(uid, null, summary);
    // }

    // try {
    //   const response = await fetch('https://jovialblandabstracttype.armahin.repl.co/generate-images', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ uid }),
    //   });

    //   const data = await response.json();
    //   console.log("server response")
    //   console.log(data)

    //   if (!response.ok) {
    //     console.error('Server response was not ok');
    //   }
    // } catch (error) {
    //   console.error(error);
    // }
  });
}


async function sendImageUrlToAirtable(imageUrl) {
  chrome.storage.local.get('auth_token', async (result) => {
    const auth_token = result.auth_token;

    const imageID = await fetch("https://ava-backend-0jva.onrender.com/add_image", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        authId: auth_token, 
        image_url: imageUrl
      })
    });
    console.log(imageID.json());
    
    // if (!uid) {
    //   console.error("UID not found in local storage");
    //   updateContextMenu(); // Add this line
    //   return;
    // }

    // const existingRecord = await getRecordByUid(uid);

    // if (existingRecord) {
    //   await updateRecord(existingRecord.id, imageUrl, summary); // Pass the summary here
    // } else {
    //   await createRecord(uid, imageUrl, summary); // Pass the summary here
    // }
    // summary = null;
  });
}

// async function getRecordByUid(uid) {
//   try {
//     const response = await fetch(`https://extensionendpoint.armahin.repl.co/airtable/record/${uid}`);
//     console.log("getRecordByUid response", response);
//     if (!response.ok) {
//       console.error("Error response from Server:", response.statusText);
//       return null;
//     }

//     const data = await response.json();
//     return Object.keys(data).length === 0 ? null : data; // Check if data is an empty object
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
  
// }

// async function createRecord(uid, imageUrl, summary) {
//   const url = `https://extensionendpoint.armahin.repl.co/airtable/create`;
//   const data = {
//     uid: uid,
//     imageUrl: imageUrl || "",
//     summary: summary || "",
//   };

//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(data),
//     });
//     console.log("createRecord response", response); // Add this line
//     const responseData = await response.json();
//     return responseData;
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// }


// async function updateRecord(recordId, imageUrl, summary) {
//   const record = await getRecordById(recordId);
  
  
//   if (record === null) {
//     console.error("Record not found");
//     return null;
//   }

//   const updatedImageLinks = imageUrl ? (record.fields.image_links + "," + imageUrl) : record.fields.image_links;

//   let summariesArray = record.fields.summaries ? record.fields.summaries.split(',') : [];
//   if (summary) {
//     summariesArray.push(summary);
//   }
//   const updatedSummaries = summariesArray.join(',');
//   const url = `https://extensionendpoint.armahin.repl.co/airtable/update/${recordId}`;
//   const data = {
//     imageUrl: updatedImageLinks,
//     summary: updatedSummaries,
//   };

//   try {
//     const response = await fetch(url, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     });

//     console.log("updateRecord response", response); // Add this line

//     if (!response.ok) {
//       const errorResponse = await response.text();
//       console.error("Error response from Server:", errorResponse);
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const jsonResponse = await response.json();
//     console.log("Record updated in Server:", jsonResponse);
//     return jsonResponse;
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// }

// async function getRecordById(recordId) {
//   try {
//     const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${recordId}`;
//     const response = await fetch(url, {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
//         },
//       });
    
//     console.log("getRecordById response", response);
//     if (!response.ok) {
//       console.error("Error response from Server:", response.statusText);
//       return null;
//     }

//     const jsonResponse = await response.json();
//     return jsonResponse;
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// }


    
   
    