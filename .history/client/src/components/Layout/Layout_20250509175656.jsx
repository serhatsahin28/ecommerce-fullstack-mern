// import React from 'react';
// import Header from './Header';
// import Footer from './Footer';
// import { Container } from 'react-bootstrap';
// import HomeBody from '../HomeBody';

// const Layout = ({ children }) => {
//   return (
//     <>
//       <Header />
//       <Container fluid className="flex-grow-1">{children}</Container>
//       <HomeBody />
  
//       <Footer />
//     </>
//   );
// };

// export default Layout;



import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Container } from 'react-bootstrap';
import HomeBody from '../HomeBody';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <Container fluid className="flex-grow-1">{children}</Container>
      <HomeBody />
  
      <Footer />
    </>
  );
};

export default Layout;
