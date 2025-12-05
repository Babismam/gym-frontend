import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Navbar from '../components/Navbar'; 

export default function Dashboard() {
  const { username, role, handleLogout } = useContext(AuthContext);

  const renderLinks = () => {
    switch (role) {
      case "admin":
        return (
          <>
            <Link to="/members" className="dashboard-link">Manage Members</Link>
            <Link to="/trainers" className="dashboard-link">Manage Trainers</Link>
            <Link to="/programs" className="dashboard-link">Manage Programs</Link>
          </>
        );
      case "trainer":
        return (
          <>
            <Link to="/members" className="dashboard-link">View Your Members</Link>
            <Link to="/programs" className="dashboard-link">View Programs</Link>
          </>
        );
      case "member":
        return (
          <>
            <Link to="/programs" className="dashboard-link">My Programs</Link>
          </>
        );
      default:
        return <p>Unknown role</p>;
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Welcome, {username}!</h2>
          <p>Role: <strong>{role}</strong></p>
          <div style={styles.linksContainer}>{renderLinks()}</div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "80vh",
  },
  card: {
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    backgroundColor: "#fff",
    width: "350px",
  },
  linksContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px",
  },
  logoutBtn: {
    marginTop: "30px",
    padding: "10px 20px",
    backgroundColor: "#e63946",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};