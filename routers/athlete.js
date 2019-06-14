const expressRouter = require('express').Router();


var request = require('request');





expressRouter.post('/:id', function(req, res) {
    //console.log('we are here', req.params.id);
    
    //Send request to zoho Analytics api
    request('https://analyticsapi.zoho.com/api/vpoduval@boxout.ca/BoxOut+Athlete+Analytics/Add+Athlete?ZOHO_ACTION=EXPORT&ZOHO_OUTPUT_FORMAT=JSON&ZOHO_ERROR_FORMAT=JSON&authtoken=8c86f31fdafbe747185001e23984a752&ZOHO_API_VERSION=1.0', 
    async function (error, response, body) {
    // console.log('error:', error); // Print the error if one occurred
    // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    // console.log('body:', body); // Print the HTML for the Google homepage.
    if(response){
      //parse the Response onto JSON object,  Replace opostrophies( ' ) with " 
      let result = JSON.parse(body.replace(/'/g,"\""));
       
      //Find the Desired Athlete From Response 
     
      let desiredAthlete = result.response.result.rows.find( row => {
       return row[0] === req.params.id;
     });

     if(!desiredAthlete){
      res.send('Athlete Not Found');
      return;
     }
     var athlete ={personal : {},
                   skilllevel: {
                     Speed: {},
                     Agility: {},
                     LowerBodyPower: {},
                     UpperBodyPower:{},
                     CorePower: {},
                     Biometric: {},
                   },
                   bulletGraphData: {}, 
                   visualsensoryresult: {},
                   conginitiveresult: {},
                   atheletetypereport:{
                     TAPresults :{},
                   },
                  };
     for(let i=0 ; i < result.response.result.column_order.length; i ++){
       athlete.personal[result.response.result.column_order[i].toString().replace(/\s/g, '')] = desiredAthlete[i];
     }

     //get athletes test reults statistics from Combine Result statistics
     await getTestResultStaticticForAthlete(athlete);
    
     await  getVisualSensoryResultsForAthlete(athlete);
     
     await getCognitiveResultsForAthlete(athlete);
  
     await getTAPresultsforAthlete(athlete);

    res.json({"athlete":athlete});


    }
    else{
      res.send(error);

    }
});

  })



getTestResultStaticticForAthlete = (athlete) => {
   return new Promise((resolve, reject) => {
    //Send request to zoho Analytics api
    request('https://analyticsapi.zoho.com/api/vpoduval@boxout.ca/BoxOut+Athlete+Analytics/Combine Results Statistics?ZOHO_ACTION=EXPORT&ZOHO_OUTPUT_FORMAT=JSON&ZOHO_ERROR_FORMAT=JSON&authtoken=8c86f31fdafbe747185001e23984a752&ZOHO_API_VERSION=1.0', 
    function (error, response, body) {
    if(response){
      //parse the Response onto JSON object,  Replace opostrophies( ' ) with " 
      let result = JSON.parse(body.replace(/'/g,"\""));
       
      //Find the Desired Athlete From Response 
      
      let desiredTests = result.response.result.rows.filter(row => { return row[1] === athlete.personal.ID });
      // console.log(desiredTests);
       let alltests = [];
       desiredTests.forEach(element => {

          alltests.push(element[3]);
          var sum  = 0;
          var max = 0;
        
          var allsuchtests = result.response.result.rows.filter(row => {return row[2] === element[2]});
          //console.log(element[2],allsuchtests.length,sum, avg);
          allsuchtests.forEach(el => {
            sum = sum + parseInt(el[6]);
            if(parseInt(el[6]) > max){
              max = parseInt(el[6]);
            }
          })
          var avg = sum / allsuchtests.length;
          var arrayOfScores = [
            {"name":"score", "score": element[6]},
            {"name":"combinebest", "best": max},
            {"name":"combineAvg", "avg": avg}
          ];
          if(element[2]=== "Push Ups" || element[2]=== "Med Ball Toss" || element[2]=== "Hanging Chins" ){
          
            athlete.skilllevel.UpperBodyPower[element[2].toString().replace(/\s/g, '')] = arrayOfScores;
          }
          else if(element[2]=== "Rotational Right" || element[2]=== "Rotational Left" || element[2]=== "Sit Ups"){
           
            athlete.skilllevel.CorePower[element[2].toString().replace(/\s/g, '')] = arrayOfScores;
          }
          else if(element[2]=== "Vertical Jump" || element[2]=== "Wall Sit" || element[2]=== "Broad Jump" || element[2]=== "Max Vertical Jump" ){
           
            athlete.skilllevel.LowerBodyPower[element[2].toString().replace(/\s/g, '')] = arrayOfScores;

          }
          else if(element[2].includes("Agility")){
           
            athlete.skilllevel.Agility[element[2].toString().replace(/\s/g, '')] = arrayOfScores;
          }
          else if(element[2]=== "Hand Width" || element[2] === "Hand Length" || element[2] === "Wingspan" || element[2] === "Standing Reach" || element[2] === "Height" ||
          element[2]=== "Weight"){
            
            athlete.skilllevel.Biometric[(element[2].toString().replace(/\s/g, ''))] = arrayOfScores;
          }
          else{
            
            athlete.skilllevel.Speed[element[2].toString().replace(/\s/g, '')] = arrayOfScores;
          }
         
      });

      resolve();

     
    }
    else{
      reject(error);

    }
});
  });
}

getVisualSensoryResultsForAthlete = (athlete) => {
  return new Promise((resolve, reject) => {
    //Send request to zoho Analytics api
    request('https://analyticsapi.zoho.com/api/vpoduval@boxout.ca/BoxOut+Athlete+Analytics/Visual+Evaluations?ZOHO_ACTION=EXPORT&ZOHO_OUTPUT_FORMAT=JSON&ZOHO_ERROR_FORMAT=JSON&authtoken=8c86f31fdafbe747185001e23984a752&ZOHO_API_VERSION=1.0', 
    function (error, response, body) {
    if(response){
      //parse the Response onto JSON object,  Replace opostrophies( ' ) with " 
      let result = JSON.parse(body.replace(/'/g,"\""));
       
      //Find the Desired Athlete From Response
      let desiredresults = result.response.result.rows.filter(row => { return row[1] === athlete.personal.ID });
      //console.log(desiredresults);
      desiredresults.forEach(element => {
        athlete.visualsensoryresult[element[2].toString().replace(/\s/g, '')] = {
          "EvaluationDate": element[3],
          "Range": element[4],
          "Score": element[5],
          "name": element[2]
        }
      });

      resolve();
    }
    else{
      reject(error);

    }
});
  });
}


getCognitiveResultsForAthlete = (athlete) => {
  return new Promise((resolve, reject) => {
    //Send request to zoho Analytics api
    request('https://analyticsapi.zoho.com/api/vpoduval@boxout.ca/BoxOut+Athlete+Analytics/Cognitive+Evaluations?ZOHO_ACTION=EXPORT&ZOHO_OUTPUT_FORMAT=JSON&ZOHO_ERROR_FORMAT=JSON&authtoken=8c86f31fdafbe747185001e23984a752&ZOHO_API_VERSION=1.0', 
    function (error, response, body) {
    if(response){
      //parse the Response onto JSON object,  Replace opostrophies( ' ) with " 
      let result = JSON.parse(body.replace(/'/g,"\""));
       
      //Find the Desired Athlete From Response
      let desiredresults = result.response.result.rows.filter(row => { return row[1] === athlete.personal.ID });
     // console.log(desiredresults);
      desiredresults.forEach(element => {
        athlete.conginitiveresult[element[3].toString().replace(/\s/g, '')] = {
          "EvaluationDate": element[2],
          "Score": element[4]
        }
      });

      resolve();
    }
    else{
      reject(error);

    }
});
  });
}


getTAPresultsforAthlete = (athlete) => {
  return new Promise((resolve, reject) => {
    //Send request to zoho Analytics api
    request('https://analyticsapi.zoho.com/api/vpoduval@boxout.ca/BoxOut+Athlete+Analytics/TAP+Evaluations?ZOHO_ACTION=EXPORT&ZOHO_OUTPUT_FORMAT=JSON&ZOHO_ERROR_FORMAT=JSON&authtoken=8c86f31fdafbe747185001e23984a752&ZOHO_API_VERSION=1.0', 
    function (error, response, body) {
    if(response){
      //parse the Response onto JSON object,  Replace opostrophies( ' ) with " 
      let result = JSON.parse(body.replace(/'/g,"\""));
       
      //Find the Desired Athlete From Response
      let desiredresults = result.response.result.rows.filter(row => { return row[1] === athlete.personal.ID });
     // console.log(desiredresults);
      desiredresults.forEach(element => {
        athlete.atheletetypereport.TAPresults[element[2].toString().replace(/\s/g, '')] = {
          "EvaluationDate": element[3],
          "Score": element[4]
        }
      });

      resolve();
    }
    else{
      reject(error);

    }
});
  });
}

// getCombineTestStatisticsForEachTest = (alltests, athlete) => {
//     return new Promise((resolve, reject) => {
//     //Send request to zoho Analytics api
//     request('https://analyticsapi.zoho.com/api/vpoduval@boxout.ca/BoxOut+Athlete+Analytics/Combine+Test+Statistics?ZOHO_ACTION=EXPORT&ZOHO_OUTPUT_FORMAT=JSON&ZOHO_ERROR_FORMAT=JSON&authtoken=8c86f31fdafbe747185001e23984a752&ZOHO_API_VERSION=1.0', 
//     function (error, response, body) {
//     if(response){
//       //parse the Response onto JSON object,  Replace opostrophies( ' ) with " 
//       let result = JSON.parse(body.replace(/'/g,"\""));
//        alltests.forEach(element => {
//         let combTestStats = result.response.result.rows.filter(row => { return row[0] === element });
//         let max = 0;
//         sum = 0;
//         combTestStats.forEach(element => {
//           sum = sum + element[7];
//           if(element[9] > max ){
//             max = element[9];
//           }
//         })
//         let avg = sum / combTestStats.length;
//         athlete.skilllevel[combTestStats[0][4].toString().replace(/\s/g, '')][combTestStats[0][2].toString().replace(/\s/g, '')]["combineBest"] = max;

//       //  console.log('here     ',combTestStats);
//       });

//       resolve(alltests);

//     }
//     else{
//       reject(error);

//     }
// });
//   });
// }


module.exports = expressRouter;