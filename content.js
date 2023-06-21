(async function () {
    function scrapeText() {
      const relevantSelectors = ['main', 'article', '#content', '.story'];
      const excludedSelectors = ['script', 'style'];
      let text = '';
    
      relevantSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (element.innerText) {
            text += '\n' + element.innerText;
          }
        });
      });
    
      excludedSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          text = text.replace(element.innerText, '');
        });
      });
    
      text = text.replace(/(<([^>]+)>)/gi, ''); // remove HTML tags
      text = text.replace(/[^a-zA-Z0-9\s]/g, ''); // remove punctuation
    
      return text;
    }
    
    
      function sendSummaryToBackground(summary) {
        chrome.runtime.sendMessage({ summary });
      }
    
      const scrapedText = scrapeText();
      const lines = scrapedText.split('\n');
      const startIndex = 2;
      const endIndex = Math.min(lines.length, startIndex + 100);
      const textAfterFirst38Lines = lines.slice(startIndex, endIndex).join('\n');
    
      const summary = await summarizeText(textAfterFirst38Lines, 5);
      console.log('Summary:', summary);
    
      sendSummaryToBackground(summary);
    })();
    
    async function summarizeText(text, summaryLength) {
      // Replace YOUR_API_KEY with your actual API key
      const apiKey = "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";
    
      // The GPT-4 API endpoint for generating chat completions
      const apiEndpoint = "https://api.openai.com/v1/chat/completions";
    
      // The request payload
      const data = {
        messages: [
          { role: "system", content: "You are a helpful assistant that summarizes text to make it as interesting and edgy as possible. Dont include the words edgy and interesting" },
          { role: "user", content: `Summarize the following text in ${summaryLength} words or fewer: ${text} without any "," and the summarized text has to be very interesting and unique and mature - no using interesting or unique or mature to describe stuff` }
        ],
        model: "gpt-4",
        temperature: 0,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    
      // Make the request to the GPT-4 API using fetch
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(data)
      });
    
      // Parse the response and return the summary
      const responseData = await response.json();
    
      console.log('GPT-4 Response:', responseData);
  
      // Remove commas from the text
      const summaryText = responseData.choices[0].message.content.replace(/,/g, '');
          
      return summaryText;
      
    }