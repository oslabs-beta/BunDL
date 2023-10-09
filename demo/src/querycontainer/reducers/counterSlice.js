import { createSlice } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

const initialState = {
  fields: [],
  logs: [],
  speed: [],
};

//dispatch(add(value))

// const add (value) => {
//   type: add
//   payload: value
// }

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    add: (state, action) => {
      console.log('this is add');
      console.log('this is action.payload', action.payload);
      state.fields.push(action.payload);
      console.log([...state.fields]);
    },
    remove: (state, action) => {
      const newArr = [];
      for (let i = 0; i < state.fields.length; i++) {
        if (state.fields[i] !== action.payload) {
          newArr.push(state.fields[i]);
        }
      }
      state.fields = newArr;
    },
    query: (state) => {
      console.log('query reducer here');
      state.logs.push(state.fields);
      console.log([...state.logs]);
    },
    fetch: (state) => {
      const apiUrl = '/api/query';
      //queryString --> `{ query: "{ \n USERS { \n STATE.FIELD1 \n STATE.FIELD2 \n ADDRESS {\n STATE.FIELD.ADDRES.CITY \n } } }" }`
      // we want to dynamically send the query based on what fields wehave selected
      let queryString = '{';
      // need to iterate on our fields array to see what is currently in there
      state.fields.forEach((field, index) => {
        // for each element if its not contained in the address object
        if (field !== 'address'){
          queryString += `\n${field}`;
        }
      })
        // we want to add it to our query string with \n before

      const postData ={
       query: queryString
      };

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify(postData)
      })
      .then (response => {
        if(response.ok){
          return response.json();
        }
        throw new Error('Reponse is not ok');
      })
      .then(data => {
        state.speed.push(data)
      })
      .catch(error => {
        console.error('Issue occured when fetching from api/query');
      })
    }




    // fetch: (state) => {
    //   const apiUrl = '/api/query';
    //   const postData = {
    //     // fetch the data dynamically based on fields user has selected
    //     { query: value };
    //     fetch(apiUrl, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type' : 'application/json'
    //       },
    //       body: JSON.stringify(postData),

    //     })
    //   .then(response => {
    //   if (response.ok){
    //     return response.json();
    //     }
    //   })
    // }



      // state.fields
      // use fields to update the format  + query / users keys - ask andrew what format we need to use to make this request
      // make sure our format matches the graphql
      // post request on graphql and check server bundlCache.query

/*  const apiUrl = 'route'
    const postData = {
        query: "{\n    users {\n    firstName\n    lastName\n    email\n    address {\n      street\n      city\n      state\n      zip\n      country\n    }\n  }\n}"
      };

fetch(apiUrl , {
  method: 'POST,
  headers: {
    'Content-Type: 'application/json'
  },
  body: JSON.stringify(postData)
})
// push speed to array
.then ( res => {
if (response.ok){
  return response.json()
}
})


*/


      /*
      {
        users {
          firstName
          lastName
          email
          address {
            street
            city
            state
            zip
            country
          }
        }
      }

      {
  query: "{\n    users {\n    firstName\n    lastName\n    email\n    address {\n      street\n      city\n      state\n      zip\n      country\n    }\n  }\n}"
}
      */



    }
  },
);

export const { add, remove, query } = counterSlice.actions;

export default counterSlice.reducer;
