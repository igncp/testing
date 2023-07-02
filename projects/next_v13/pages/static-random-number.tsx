import React from "react";

type Props = {
  randomNum: number;
};

const StaticRandomNumber = ({ randomNum }: Props) => {
  return <h1>{randomNum}</h1>;
};

export const getStaticProps = () => {
  return {
    props: {
      randomNum: Math.random().toFixed(2),
    },
  };
};

export default StaticRandomNumber;
