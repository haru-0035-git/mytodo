import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="text-center text-gray-600 p-4 ">
      <p>&copy; {new Date().getFullYear()} ToDo App. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
