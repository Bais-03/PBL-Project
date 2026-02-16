import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Browse</Link> |{" "}
      <Link to="/create">Add Listing</Link>
    </nav>
  );
}