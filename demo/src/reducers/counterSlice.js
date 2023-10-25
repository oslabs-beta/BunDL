import bunCache from '../bunDL-client/src/bunCache.js';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const bunDLClient = new bunCache();

const initialState = {
  fields: [],
  logs: [],
  requests: 0,
  fetchSpeed: [],
  cache: [],
  formattedQuery: '',
  companynames: ['company', 'city', 'state'],
  departmentnames: ['departmentName'],
  productnames: ['productName', 'productDescription', 'price'],
};
//queryString --> `{ query: "{ \n USERS { \n STATE.FIELD1 \n STATE.FIELD2 \n ADDRESS {\n STATE.FIELD.ADDRES.CITY \n } } }" }`

// )

export const fetchSpeed = createAsyncThunk('counter/api/query', async (data) => {
  console.log('dataaa:', data);
  try {
    console.log('fetch......');
    const results = await bunDLClient.clientQuery(data);
    console.log('results', results);
    return results.cachedata;
  } catch (err) {
    console.log(err);
  }
});

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    addField: (state, action) => {
      // console.log('this is add');
      // console.log('this is action.payload', action.payload);
      state.fields.push(action.payload);
      // console.log([...state.fields]);
    },
    removeField: (state, action) => {
      const newArr = [];
      for (let i = 0; i < state.fields.length; i++) {
        if (state.fields[i] !== action.payload) {
          newArr.push(state.fields[i]);
        }
      }
      state.fields = newArr;
    },
    submitQuery: (state) => {
      // console.log('query reducer here');
      state.logs.push(state.fields);
      state.requests = state.requests + 1;
      // console.log([...state.logs]);
    },

    clearLog: (state) => {
      state.logs = [];
      state.fetchSpeed = [];
      state.cache = [];
    },

    formatQuery: (state) => {
      let queryString = '';
      let companyString = '\n company (id: "company1"){ ';
      let departmentString = `\n department (id: "department1") {`;
      let productString = '\n product (id: "product1") {';
      let companyExist = false;
      let departmentExist = false;
      let productExist = false;

      // need to iterate on our fields array to see what is currently in there
      state.fields.forEach((field) => {
        // for each element if its not contained in the address object
        if (state.companynames.includes(field)) {
          // queryString += `\n${field}`
          console.log('companynames exist');
          companyString += `\n${field} `;
          companyExist = true;
        } else if (state.departmentnames.includes(field)) {
          // append whatever is in the address object in our state.field to queryString
          departmentString += `\n${field} `;
          departmentExist = true;
        } else if (state.productnames.includes(field)) {
          productString += `\n${field} `;
          productExist = true;
        }
      });
      // close querySTring
      if (companyExist) {
        queryString += companyString + '\n} \n}';
      }
      if (departmentExist) {
        queryString += departmentString + '\n} \n}';
      }
      if (productExist) {
        queryString += productString + '\n} \n}';
      }
      state.formattedQuery = queryString;
      console.log('FINAL QS', state.formattedQuery);
    },
  },
  extraReducers: async (state) => {
    // builder = state, addCase=conditionals based on Action, fulfilled = status promise
    state.addCase(fetchSpeed.fulfilled, (state, action) => {
      if (action.payload) {
        // console.log('payload cache', action.payload);
        // console.log('payload speed', action.payload.speed);
        state.fetchSpeed.push(Math.round(action.payload.speed));
        state.cache.push(action.payload.cache);
        // console.log('fetchspeed', [...state.fetchSpeed]);
        // console.log([...state.cache]);
      }
    });
    state.addCase(fetchSpeed.rejected, (state, action) => {
      console.error('Fetch speed request rejected:', action.error);
      // Handle the error as needed
    });
  },
});

export const { addField, removeField, submitQuery, formatQuery, clearLog } = counterSlice.actions;

export default counterSlice.reducer;
