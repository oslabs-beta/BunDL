// const request = await req.json();
// console.log(typeof request.query);
// console.log('request is: ', request.query);
// const id = extractIdFromQuery(request.query);
// console.log('the id is: ', id);

const object = {
  _id: {
    $oid: '6521adda0f0a929362e5a806',
  },
  firstName: 'Nathan',
  lastName: 'Wiegand',
  email: 'Pietro.Muller@hotmail.com',
  phoneNumber: '(916) 811-5560 x61056',
  address: {
    street: '235 Grant View',
    city: 'Corkeryview',
    state: 'New Hampshire',
    zip: '58793',
    country: 'Iran',
  },
};

const jsonString = JSON.stringify(object);
// .replace(/"/g, '\\"');
console.log(jsonString);

('6521adda0f0a929362e5a806');

('{"_id":{"$oid":"6521adda0f0a929362e5a806"},"firstName":"Nathan","lastName":"Wiegand","email":"Pietro.Muller@hotmail.com","phoneNumber":"(916) 811-5560 x61056","address":{"street":"235 Grant View","city":"Corkeryview","state":"New Hampshire","zip":"58793","country":"Iran"}}');

('{"_id":{"$oid":"6521adda0f0a929362e5a806"},"firstName":"Nathan","lastName":"Wiegand","email":"Pietro.Muller@hotmail.com","phoneNumber":"(916) 811-5560 x61056","address":{"street":"235 Grant View","city":"Corkeryview","state":"New Hampshire","zip":"58793","country":"Iran"}}');

JSON.SET '6521adda0f0a929362e5a806' $ '{"_id":{"$oid":"6521adda0f0a929362e5a806"},"firstName":"Nathan","lastName":"Wiegand","email":"Pietro.Muller@hotmail.com","phoneNumber":"(916) 811-5560 x61056","address":{"street":"235 Grant View","city":"Corkeryview","state":"New Hampshire","zip":"58793","country":"Iran"}}'

JSON.SET '6521adda0f0a929362e5a807' $ '{"_id":{"$oid": "6521adda0f0a929362e5a807"},"firstName": "Barney","lastName":"Leffler","email": "Tabitha_Larson60@yahoo.com","phoneNumber":"722.727.8944","address": {"street": "70268 Lavon Park","city":"Towson","state": "Connecticut","zip": "01661","country": "Mozambique"}}'