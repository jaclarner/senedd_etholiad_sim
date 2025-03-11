import React from 'react';

function Footer() {
  return (
    <footer className="app-footer">
      <p>Created by Jac M. Larner</p>
      <p>© {new Date().getFullYear()} - Cardiff University</p>
    </footer>
  );
}

export default Footer;