import React from "react";

const Header: React.FC = () => {
  return (
    <header className="text-black p-4 w-hull flex flex-row">
      <div className="basis-1/20">
        <button className="square h-full w-full bg-black text-white">O</button>
      </div>
      <h1 className="text-4xl font-bold text-left basis-10/20">ToDo App</h1>
      <div className="basis-9/20 flex justify-end items-center">
        <button className="circle h-10 w-10 bg-black text-white rounded-full">
          O
        </button>
      </div>
    </header>
  );
};
export default Header;
