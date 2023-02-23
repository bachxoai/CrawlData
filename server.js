const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request-promise');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: 'out.csv',
  header: [
    {id: 'title', title: 'Title'},
    {id: 'authors', title: 'Authors'},
    {id: 'releasedDate', title: 'Released Date'},
    {id: 'newsNumber', title: 'News Number'},
  ]
});

request('https://jprp.vn/index.php/JPRP/issue/archive', (error, response, html) => {
  if(!error && response.statusCode == 200) {
    const $ = cheerio.load(html);
    let result = [];
    $('.issue-summary').each((index, el) => { 
      const url1 = $(el).find('a').attr('href');

      request(url1, (error, response, html) => {
        if(!error && response.statusCode == 200) {
          const $ = cheerio.load(html);
          $('.col-md-10').each((index, el) => { 
            const url2 = $(el).find('a').attr('href');

            if (!(url2 === undefined)) {
              request(url2, (error, response, html) => {
                if(!error && response.statusCode == 200) {
                  const $ = cheerio.load(html);
                  $('html').each((index, el) => { 
                    const title = $(el).find('header h2').text().trim();
                    const authors = $(el).find('#authorString i').text().trim();
                    const releasedDate = $(el).find('.date-published').text().trim().slice(15);
                    const newsNumber = $(el).find('a.title').text().trim();
                    result.push({title, authors, releasedDate, newsNumber});
                    console.log(result);

                    csvWriter.writeRecords(result);
                  })
                } else {
                  console.log(error);
                }
              });
            }
          })
        } else {
          console.log(error);
        }
      });
    })
  } else {
    console.log(error);
  }
});
