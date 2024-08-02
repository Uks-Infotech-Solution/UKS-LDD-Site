import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../DashBoard/DashBoardDesign/Header_Dashboard.css';
import './Customer_Login_Dashboard.css';
import { useSidebar } from '../Customer/Navbar/SidebarContext';
import Last_Div from './Last_div';
import { PiCircleFill } from "react-icons/pi";
import VerticalBoxes from './Vertical_Box'; // Import the new component
import PathnameUrlPath from '../URL_Path/Url_Path';
import Top_5_DSA from './Top-5-DSA';

function Customer_Login_Dashboard() {
    const { isSidebarExpanded } = useSidebar();
    const [downloadTableCount, setDownloadTableCount] = useState(0);
    const [tableCount, setTableCount] = useState(0);
    const [lastLoginDateTime, setLastLoginDateTime] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { customerId } = location.state || {};
    // console.log(customerId);
    const [customerDetails, setCustomerDetails] = useState(null);

    useEffect(() => {
        if (customerId) {
            fetchDownloadTableCount(customerId);
            fetchTableCount(customerId);
            fetchCustomerDetails(customerId);
            fetchLastLoginSession(customerId);
        }
    }, [customerId]);

    const fetchDownloadTableCount = async (customerId) => {
        try {
            const response = await axios.get(`http://localhost:8000/dsa-customer/downloadtable/count?customerId=${customerId}`);
            setDownloadTableCount(response.data.count);
        } catch (error) {
            console.error('Error fetching download table count:', error.message);
        }
    };

    const fetchTableCount = async (customerId) => {
        try {
            const response = await axios.get(`http://localhost:8000/dsa-customer/table/count?customerId=${customerId}`);
            setTableCount(response.data.count);
        } catch (error) {
            console.error('Error fetching table count:', error.message);
        }
    };

    const fetchCustomerDetails = async (customerId) => {
        try {
            const response = await axios.get('http://localhost:8000/customer-details', {
                params: { customerId: customerId }
            });
            setCustomerDetails(response.data);
        } catch (error) {
            console.error('Error fetching customer details:', error.message);
        }
    };

    const fetchLastLoginSession = async (customerId) => {
        try {
            const response = await axios.get('http://localhost:8000/customer/login/last-session', {
                params: { customerId: customerId }
            });
            setLastLoginDateTime(response.data.loginDateTime);
            // console.log(response.data.loginDateTime);
        } catch (error) {
            console.error('Error fetching last login session:', error.message);
        }
    };
    
    const homepage = () => {
        navigate('/customer-dashboard');
    };

    return (
        <>
            <div className={`dash-url-expand ${isSidebarExpanded ? 'sidebar-expanded' : ''}`}>
                <PathnameUrlPath location={location} homepage={homepage} />
            </div>
            <Container fluid className={`Customer-dash-container Customer-table-container-second ${isSidebarExpanded ? 'sidebar-expanded' : ''}`}>
                <VerticalBoxes /> {/* Use the new component */}
                <div>
                    <Row className='' style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0px' }}>
                        <div className='Customer-dashboard-head'>
                            <h3>Customer Dashboard :-</h3>
                            <hr />
                        </div>
                        <Col lg={3} xs={12} sm={6} md={3} className='mt-2'>
                            <div className='count-box Customer-table-container-second'>
                                <div>
                                    <p>DSA Download Count</p>
                                    <h3>{downloadTableCount}</h3>
                                </div>
                            </div>
                        </Col>
                        <Col lg={3} xs={12} sm={6} md={3} className='mt-2'>
                            <div className='count-box Customer-table-container-second'>
                                <div>
                                    <p>DSA View Count</p>
                                    <h3>{tableCount}</h3>
                                </div>
                            </div>
                        </Col>
                        <Col lg={3} xs={12} sm={6} md={3} className='mt-2'>
                            <div className='count-box Customer-table-container-second'>
                                <div>
                                    <p>DSA Rejection Count</p>
                                    <h3>{tableCount}</h3>
                                </div>
                            </div>
                            
                        </Col>
                        <Col lg={3} xs={12} sm={6} md={3} className='mt-2'>
                            <div className='count-box cus-code Customer-table-container-second' style={{ color: '#145693', padding:'5px' }}>
                                <div>
                                    {customerDetails && (
                                        <>
                                            <p style={{fontSize:'12px'}}><span style={{ fontWeight: '600' , fontSize:'12px'}}>Customer Code: </span>UKS-CUS-0{customerDetails.customerNo}</p>
                                            <p><span style={{ fontWeight: '600',fontSize:'12px' }}>Customer Status: </span>
                                                <span style={{ color: customerDetails.isActive ? 'green' : 'red', fontWeight: '700',fontSize:'12px'}}>
                                                <PiCircleFill size={10} style={{ marginRight: '1px' }} />
                                                    {customerDetails.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </p>
                                            {lastLoginDateTime && (
                                                <p><span style={{ fontWeight: '600',fontSize:'12px' }}>Last Login: </span>
                                                <span style={{fontSize:'10px'}}>
                                                {new Date(lastLoginDateTime).toLocaleString()}

                                                </span>
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </Col>
                        <Last_Div />
                        <Top_5_DSA/>
                    </Row>
                </div>
            </Container>
        </>
    );
}

export default Customer_Login_Dashboard;
