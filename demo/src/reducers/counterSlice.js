import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bunCache from '../bunDL-client/src/bunCache.js';

const bunCash = new bunCache();

const initialState = {
  fields: [],
  logs: [],
  requests: 0,
  fetchSpeed: [],
  cache: [],
  formattedQuery: '',
  fieldnames: ['lastName', 'firstName', 'email'],
  addressnames: ['street', 'city', 'state', 'zip', 'country'],
};
//queryString --> `{ query: "{ \n USERS { \n STATE.FIELD1 \n STATE.FIELD2 \n ADDRESS {\n STATE.FIELD.ADDRES.CITY \n } } }" }`

export const metrics = createAsyncThunk('counter/metrics', async (data) => {
  console.log('dataaa:', data);
  try {
    console.log('fetch......');
    const res = await fetch('/api/cache', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: data }),
    });
    const results = await res.json();
    console.log('results', results);
    return results;
  } catch (err) {
    console.log(err);
  }
});

// export const bunClient = createAsyncThunk(

// )

export const fetchSpeed = createAsyncThunk(
  'counter/api/query',
  async (data) => {
    console.log('dataaa:', data);
    try {
      console.log('fetch......');
      // const results = await bunCash.clientQuery(data);
      const res = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: data }),
      });
      const results = await res.json();
      console.log('results', results);
      return results;
    } catch (err) {
      console.log(err);
    }
  }
);

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    addField: (state, action) => {
      console.log('this is add');
      console.log('this is action.payload', action.payload);
      state.fields.push(action.payload);
      console.log([...state.fields]);
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
      console.log('query reducer here');
      state.logs.push(state.fields);
      state.requests = state.requests + 1;
      console.log([...state.logs]);
    },

    clearLog: (state) => {
      state.logs = [];
      state.fetchSpeed = [];
      state.cache = [];
    },

    formatQuery: (state) => {
      console.log('this is formatquery');
      let queryString = '{\n user { ';
      let addressString = `\n address {`;
      let addressExist = false;

      // need to iterate on our fields array to see what is currently in there
      state.fields.forEach((field) => {
        // for each element if its not contained in the address object
        if (state.fieldnames.includes(field)) {
          // queryString += `\n${field}`
          queryString += `\n${field} `;
        } else if (state.addressnames.includes(field)) {
          // append whatever is in the address object in our state.field to queryString
          addressString += `\n${field} `;
          addressExist = true;
        }
      });
      // close querySTring
      if (addressExist) {
        queryString += addressString + '\n}';
      }
      queryString += '\n} \n}';
      state.formattedQuery = queryString;
      console.log('FINAL QS', state.formattedQuery);
    },
  },
  extraReducers: async (state) => {
    // builder = state, addCase=conditionals based on Action, fulfilled = status promise
    state.addCase(fetchSpeed.fulfilled, (state, action) => {
      if (action.payload) {
        console.log('payload cache', action.payload);
        state.fetchSpeed.push(Math.round(action.payload.speed));
        state.cache.push(action.payload.cache);
        console.log('fetchspeed', [...state.fetchSpeed]);
        console.log([...state.cache]);
      }
    });
    state.addCase(fetchSpeed.rejected, (state, action) => {
      console.error('Fetch speed request rejected:', action.error);
      // Handle the error as needed
    });
  },
});

export const { addField, removeField, submitQuery, formatQuery, clearLog } =
  counterSlice.actions;

export default counterSlice.reducer;
