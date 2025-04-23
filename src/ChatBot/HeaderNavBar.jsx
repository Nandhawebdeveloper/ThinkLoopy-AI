import React from "react";
import "./HeaderNavBar.css";
import { LuInfinity } from "react-icons/lu"; // lucide-react

const HeaderNavBar = () => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="navbar-title ps-5">ThinkLoopy</span>
        <div className="flex items-center space-x-1">
          <LuInfinity className="text-purple-600" size={50} />
        </div>
      </div>
    </header>
  );
};

export default HeaderNavBar;
