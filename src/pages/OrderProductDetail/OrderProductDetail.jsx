import React from "react";
import { useParams } from "react-router-dom";

const OrderProductDetail = () => {
  const { id } = useParams();
  console.log("OrderProductDetail ID:", id);

  return (
    <div>
      <h1>Order Product Detail</h1>
      <p>Order ID: {id}</p>
      {/* Add more details about the order here */}
    </div>
  );
};

export default OrderProductDetail;
