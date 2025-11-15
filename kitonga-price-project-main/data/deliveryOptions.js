export const deliveryOptions = [{
  id: '1',
  deliveryDays: 7,
  price: 15000
}, {
  id: '2',
  deliveryDays: 3,
  price: 22000
},{
  id: '3',
  deliveryDays: 1,
  price: 30000
}];

export function getDeliveryOption(deliveryOptionId){
   let deliveryOption;
  deliveryOptions.forEach((option)=>{
    if (option.id === deliveryOptionId) {
      deliveryOption = option;
    }
  });

  return deliveryOption || deliveryOption[0];
}