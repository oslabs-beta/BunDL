import React from 'react-redux';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { submitQuery, fetchClient, formatQuery, fetchServer} from '../../reducers/counterSlice';
import './query.css';
import Fields from '../fields/fields';

function Query() {
  const dispatch = useDispatch();
  const fields = useSelector((state) => state.counter.fields);
  const formattedQuery = useSelector((state) => state.counter.formattedQuery);
  const queryType = useSelector((state)=>state.counter.queryType)
  const queryID = useSelector((state)=>state.counter.queryID)
  const enviornment = useSelector((state)=> state.counter.enviornment)
  //const randomQueryID = Math.floor(Math.random() * 5)
  const queryIDDescription = `(id: Company${1})`;
  const queryMutationDescription = `{ addCompany(input: {
    company: "TechCorp",
    city: "TechCity",
    state: "TechState"
  })`;
  const [click, setClick] = useState(true);
  const fieldnames = ['company', 'city', 'state'];
  const departmentnames = ['departmentName'];
  const productnames = ['productName', 'productDescription', 'price'];
  


  // renders with dependencies - formattedQuery initial empty string
  useEffect(() => {
    if (formattedQuery !== '' && enviornment === 'client') dispatch(fetchClient(formattedQuery));
    if (formattedQuery !== '' && enviornment === 'server') dispatch(fetchServer(formattedQuery));
  }, [click]);

  // once clicked dispatch submitQuery (puts fields arrays into log array) and formatQuery (runs and re renders useeffect with new state)
  const handleBoxClick = (e) => {
    e.preventDefault();
    console.log('handleboxclick');
    if (fields[0]) {
      dispatch(submitQuery());
      dispatch(formatQuery());
      click === true ? setClick(false) : setClick(true);
    }
  };

  return (
      <div className='wholecontainer'>

          <div className='queryBox'>
            <Fields />
            
            <div className='graphql-query'>
              <div className='query'>
              {queryType === '' && <> {'[select your operation type]'}</>}
              {queryType === 'query' && queryID === 'no id' && <> {`${queryType} {`}</>}
                {queryType === 'query' && queryID === 'id' && <> {`${queryType} ${queryIDDescription} {`}</>}
                {queryType === 'mutation' && <> {`${queryType} ${queryMutationDescription} {`}</>}
                <div className='indent'>
                  company {'{'}
                  <div className='indent'>
                    {fields.map((item, index) => {
                      if (fieldnames.includes(item)) {
                        return (
                          <div key={index} className='field'>
                            {item}
                          </div>
                        );
                      } else return null;
                    })}
                    <div>
                      department {'{'}
                      {fields.map((item, index) => {
                        if (departmentnames.includes(item)) {
                          return (
                            <div key={index} className='field'>
                              {item}
                            </div>
                          );
                        } else return null;
                      })}
                      
                    </div>
                    {'}'}
                  </div>
                  {'}'}
                </div>
                {'}'}
              </div>
              <div className='buttonContainer'>
                <button type='button' className='queryButton' onClick={(e) => handleBoxClick(e)}>
                  Submit Query
                </button>
              </div>
            </div>
          </div>
      </div>
    
  );
}

export default Query;
