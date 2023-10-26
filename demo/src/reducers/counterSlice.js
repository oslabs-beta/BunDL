import bunCache from '../bunDL-client/src/bunCache.js';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const bunDLClient = new bunCache();
const initialState = {
  fields: [],
  logs: [],
  fetchSpeed: [],
  cache: [],
  queryFields: [],
  formattedQuery: '',
  fieldnames: ['company', 'department', 'product'],
  companynames: ['company', 'city', 'state'],
  departmentnames: ['departmentName'],
  productnames: ['productName', 'productDescription', 'price'],
  queryID: [],
  queryType: [],
  // results: [],
  results: '',
};
export const fetchSpeed = createAsyncThunk(
  'counter/api/query',
  async (data) => {
    try {
      
      const {updatedgraphQLcachedata, cachedata} = await bunDLClient.clientQuery(data);
      console.log('results', updatedgraphQLcachedata);
      return {updatedgraphQLcachedata, cachedata}
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
      state.QueryType = [];
      state.QueryID = [];
      state.results = '';
    },

    addQueryType: (state, action) => {
      console.log(action.payload)

      state.queryType.push(action.payload);
      console.log('add querytype', [...state.queryType])
    },

    removeQueryType: (state) => {
      state.queryType = state.queryType.slice(0, state.queryType.length-1)
      console.log('remove query type', [...state.queryType])
    },

    addQueryID: (state, action) => {
      console.log(action.payload)
      state.queryID.push(action.payload);
      console.log('add queryid', [...state.queryID])
    },

    removeQueryID: (state) => {
      state.queryID = state.queryID.slice(0, state.queryID.length-1)
      console.log('removequeryid', [...state.queryID])
    },

    setQueryType: (state, action) => {
      console.log('this is setquerytype', action.payload)
      if (action.payload === 'id') state.queryID.push('client');
      else if (action.payload === 'no id') state.queryID.push('server')
      else if (action.payload === 'mutation') state.queryType = 'mutation'
      else if (!action.payload) {
        state.queryType = 'select your query type'
        state.queryID = null
      }
      console.log('this is actionpayload', action.payload)
      console.log('this is setqueryid', state.queryID)
      console.log('this is querytype', state.queryType)
  },

  /* 
  mutation {
  updatePost(id: "123", company: "Gio's New Company") {
    id
    company
    state
    city
  }
}

randomAlphabetword = ''
  */
    formatQuery: (state) => {
      let queryString;
      state.queryType[state.queryType.length - 1] === 'mutation' ? queryString = 'mutation (company:  {' : queryString = ' {'
      
      let companyExist = false;
      let departmentExist = false;
      let productExist = false;
      let companyString = '\n company (id: "company1") { ';
      let departmentString = `\n department (id: "department1") {`;
      let productString = '\n product (id: "product1") {';
      if (state.queryID[state.queryID.length - 1] === false) {
        companyString = '\n company {';
        departmentString = `\n department {`;
        productString = '\n product {';
      }
      // need to iterate on our fields array to see what is currently in there
      state.fields.forEach((field) => {
        if (state.companynames.includes(field)) {
          companyString += `\n${field} `;
          companyExist = true;
        } else if (state.departmentnames.includes(field)) {
          departmentString += `\n${field} `;
          departmentExist = true;
        } else if (state.productnames.includes(field)) {
          productString += `\n${field} `;
          productExist = true;
        }
      });
      // close querySTring
      if (companyExist) {
        queryString += companyString;
      }
      if (departmentExist) {
        queryString += departmentString;
      }
      if (productExist) {
        queryString += productString;
      }
      if (companyExist && departmentExist && productExist)
        state.formattedQuery = state.formattedQuery + queryString + '\n} \n} \n} \n}';
      else if (companyExist && departmentExist)
        state.formattedQuery = state.formattedQuery + queryString + '\n} \n} \n}';
      else if (companyExist && productExist)
        state.formattedQuery = state.formattedQuery + queryString + '\n} \n} \n}';
      else if (departmentExist && productExist)
        state.formattedQuery = state.formattedQuery + queryString + '\n} \n} \n}';
      else state.formattedQuery = queryString + '\n} \n}';
      console.log('FINAL QS', state.formattedQuery);
    },
  },
  extraReducers: async (state) => {
    // builder = state, addCase=conditionals based on Action, fulfilled = status promise
    state.addCase(fetchSpeed.fulfilled, (state, action) => {
      if (action.payload) {
        const {speed, cache} = action.payload.cachedata
        console.log('speed payload', speed)
        // console.log('payload cache', action.payload);
        // console.log('payload speed', action.payload.speed);
        state.fetchSpeed.push(Math.round(speed));
        state.cache.push(cache);
        // console.log('fetchspeed', [...state.fetchSpeed]);
        // console.log([...state.cache]);
        state.results = action.payload.updatedgraphQLcachedata
        console.log(state.results)
      }
    });

    // state.addCase(fetchSpeed.fulfilled, (state, action) => {
    //   if (action.payload) {
    //     //{graphql data: 234, company: 3444}
    //     // state.results.push(action.payload);
        
    //   }
   // })

    
    state.addCase(fetchSpeed.rejected, (state, action) => {
      console.error('Fetch speed request rejected:', action.error);
      // Handle the error as needed
    });
  },
});

export const { addField, removeField, submitQuery, formatQuery, clearLog, setQueryType, addQueryID, removeQueryID, addQueryType, removeQueryType } =
  counterSlice.actions;
export default counterSlice.reducer;