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
  queryID: '',
  queryType:'',
  queryIDLog: [],
  queryTypeLog: [],
  results: '',
  enviornment: '',
  inputData: {
    name: 'TechCorp',
    city: 'TechCity',
    usState: 'TechState'
  },
  enviornmentLog: [],
};
export const fetchClient = createAsyncThunk(
  'counter/api/client',
  async (data) => {
    try {
      const results = await bunDLClient.clientQuery(data);
      const cachedata = Object.values(results)[1]
      const graphqlresponse = Object.values(results)[0]
      console.log('graphqlresponse', graphqlresponse);
      return {graphqlresponse, cachedata}
    } catch (err) {
      console.log(err);
    }
  }
);

export const fetchServer = createAsyncThunk(
  'counter/api/server',
  async (data) => {
    try {
      const results = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({query: data})
      })
      const cachedata = Object.values(results)[1]
      const graphqlresponse = Object.values(results)[0]
      console.log('graphqlresponse', graphqlresponse);
      return {graphqlresponse, cachedata}
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
      state.fields.push(action.payload);
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
      state.logs.push(state.fields);
      state.queryIDLog.push(state.queryID)
      state.queryTypeLog.push(state.queryType)
      state.enviornmentLog.push(state.enviornment)
      console.log('fetchspeed state', [...state.fetchSpeed])
      console.log('querytype state', [...state.queryTypeLog])
      console.log('state queryid', [...state.queryIDLog])

    },
    clearLog: (state) => {
      state.logs = [];
      state.fetchSpeed = [];
      state.cache = [];
      state.queryTypeLog = [];
      state.queryIDLog = [];
      state.results = '';
    },

    setEnvironment: (state, action) => {
      state.enviornment = action.payload
    },

    addQueryType: (state, action) => {
      console.log(action.payload)
      // state.queryType.push(action.payload);
      state.queryType = action.payload;

      console.log('add querytype', state.queryType)
    },

    removeQueryType: (state) => {
      state.queryType = state.queryType.slice(0, state.queryType.length-1)
      console.log('remove query type', [...state.queryType])
    },

    addQueryID: (state, action) => {
      console.log(action.payload)
      // state.queryID.push(action.payload);
      state.queryID = action.payload

      console.log('add queryid', [...state.queryID])
    },

    removeQueryID: (state) => {
      state.queryID = state.queryID.slice(0, state.queryID.length-1)
      console.log('removequeryid', [...state.queryID])
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
      let brackets = 0;
      // state.queryType[state.queryType.length - 1] === 'mutation' ? queryString = 'mutation {' : queryString = ' {'
      if (state.queryTypeLog[state.queryTypeLog.length - 1] === 'mutation') {
        queryString = 'mutation {';
        // if there is inputData for a company
        if (state.inputData) { 
          console.log(state.inputData)
          queryString += `\n addCompany(input: {
            company: "${state.inputData.name}",
            city: "${state.inputData.city}",
            state: "${state.inputData.usState}"
          }) {
            company
            city
            state
          }}`;
        }
      } else {
        queryString = '{';
      }
      
      let companyExist = false;
      let departmentExist = false;
      let productExist = false;
      let companyString = '\n company (id: "company1") { ';
      let departmentString = `\n department (id: "department1") {`;
      let productString = '\n product (id: "product1") {';
      if (state.queryID === 'no id') {
        companyString = '\n companies {';
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
      if (companyExist && state.queryTypeLog[state.queryTypeLog.length - 1] !== 'mutation') {
        queryString += companyString;
        brackets++
      }
      if (departmentExist) {
        queryString += departmentString;
        brackets++
      }
      if (productExist) {
        queryString += productString;
        brackets++
      }

      if (brackets === 3) state.formattedQuery = queryString + ' \n} \n} \n} \n}';
      else if (brackets === 2) state.formattedQuery = queryString + ' \n} \n} \n}';
      else if (brackets === 1) state.formattedQuery = queryString + ' \n} \n}';
      else if (brackets === 0) state.formattedQuery = queryString;
        
      console.log('FINAL QS', state.formattedQuery);
    },
  },
  extraReducers: async (state) => {
    // builder = state, addCase=conditionals based on Action, fulfilled = status promise
    state.addCase(fetchClient.fulfilled, (state, action) => {
      if (action.payload) {
        if (action.payload.cachedata) {
        const {speed, cache} = action.payload.cachedata
        state.fetchSpeed.push(Math.round(speed * 100)/100);
        console.log([...state.fetchSpeed])
        state.cache.push(cache);
        }
        console.log('graphql payload', action.payload.graphqlresponse)
        state.results = action.payload.graphqlresponse
      }
    });
    
    state.addCase(fetchClient.rejected, (state, action) => {
      console.error('Fetch speed request rejected:', action.error);
    });

    // state.addCase(fetchServer.fulfilled, (state, action) => {
    //   if (action.payload) {
    //     const {speed, cache} = action.payload.cachedata
    //     console.log('speed payload', speed)
    //      console.log('cache payload', cache)
  
    //     state.fetchSpeed.push(Math.round(speed * 100)/100);
    //     console.log([...state.fetchSpeed])
    //     state.cache.push(cache);

    //     console.log('graphql payload', action.payload.graphqlresponse)
      
    //     state.results = action.payload.graphqlresponse
    //   }
    // });
    
    // state.addCase(fetchServer.rejected, (state, action) => {
    //   console.error('Fetch speed request rejected:', action.error);
    // });
  },
});

export const { addField, removeField, submitQuery, formatQuery, clearLog, setQueryType, addQueryID, removeQueryID, addQueryType, removeQueryType, setEnvironment } =
  counterSlice.actions;
export default counterSlice.reducer;