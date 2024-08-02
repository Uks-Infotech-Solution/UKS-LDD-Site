import React, { useState, useEffect } from "react";
import { Button, Col, Container, Row, Modal } from "react-bootstrap";
import axios from "axios";
import { useNavigate, useLocation } from 'react-router-dom';
import { MdHome, MdArrowForwardIos } from 'react-icons/md';
import { useSidebar } from '../Customer/Navbar/SidebarContext';
import Select from 'react-select';
import { State, City } from 'country-state-city';
import DSA_AddressForm from "./DSA_Address";
import DSA_Loan_Details from "./DSA_Loan_Details";
import { GoDotFill } from "react-icons/go";
import DSA_Branck_Details from "./DSA_Branch";
import PathnameUrlPath from "../URL_Path/Url_Path";

function DSA_Updation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { dsaId } = location.state || {};

    const homepage = () => {
        navigate('/dsa/dashboard', { state: { dsaId } });
    };

    const [editingMode, setEditingMode] = useState(false);
    const [formData, setFormData] = useState({
        _id: "",
        dsaName: "",
        dsa_status: "",
        dsaCompanyName: "",
        primaryNumber: "",
        alternateNumber: "",
        whatsappNumber: "",
        email: "",
        website: "",
        password: "",
        address: {
            state: "",
            district: "",
            city: ""
        }
    });

    const { isSidebarExpanded } = useSidebar();

    useEffect(() => {
        const fetchDSADetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/dsa?dsaId=${dsaId}`);
                const dsaDetails = response.data;
                const { address } = dsaDetails || {};
                setFormData(prevData => ({
                    ...prevData,
                    ...dsaDetails,
                    address: {
                        state: address?.state || "",
                        district: address?.district || "",
                        city: address?.city || ""
                    }
                }));
            } catch (error) {
                console.error('Error fetching DSA details:', error);
                alert("Failed to fetch DSA details");
            }
        };

        if (dsaId) {
            fetchDSADetails();
        }
    }, [dsaId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Update DSA details
            await axios.put(`http://localhost:8000/api/dsa/${formData._id}`, {
                dsaName: formData.dsaName,
                dsaCompanyName: formData.dsaCompanyName,
                primaryNumber: formData.primaryNumber,
                alternateNumber: formData.alternateNumber,
                whatsappNumber: formData.whatsappNumber,
                email: formData.email,
                website: formData.website
            });

            // Update DSA address
            await axios.put(`http://localhost:8000/api/dsa/address/${formData._id}`, {
                state: formData.address.state,
                district: formData.address.district,
                city: formData.address.city
            });

            alert("DSA details updated successfully");

        } catch (error) {
            console.error('Error updating DSA:', error);
            alert("DSA Update Failed");
        }
    };

    const handleAddressChange = (fieldName, selectedOption) => {
        setFormData(prevData => ({
            ...prevData,
            address: {
                ...prevData.address,
                [fieldName]: selectedOption ? selectedOption.label : ""
            }
        }));
    };

    const [statesList, setStatesList] = useState([]);
    const [districtsList, setDistrictsList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);

    useEffect(() => {
        const updatedStates = State.getStatesOfCountry('IN').map(state => ({
            label: state.name,
            value: state.isoCode
        }));
        setStatesList(updatedStates);
    }, []);

    const handleStateChange = (selectedState) => {
        setFormData(prevData => ({
            ...prevData,
            address: {
                ...prevData.address,
                state: selectedState.label,
                district: "",
                city: ""
            }
        }));

        const updatedDistricts = City.getCitiesOfState('IN', selectedState.value)
            .map(city => city.district)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(district => ({
                label: district,
                value: district
            }));

        setDistrictsList(updatedDistricts);
        setCitiesList([]);
    };

    const handleDistrictChange = (selectedDistrict) => {
        setFormData(prevData => ({
            ...prevData,
            address: {
                ...prevData.address,
                district: selectedDistrict.label,
                city: ""
            }
        }));

        const updatedCities = City.getCitiesOfState('IN', formData.address.state).filter(city => city.district === selectedDistrict.value).map(city => ({
            label: city.name,
            value: city.name
        }));

        setCitiesList(updatedCities);
    };

    const handleCityChange = (selectedCity) => {
        setFormData(prevData => ({
            ...prevData,
            address: {
                ...prevData.address,
                city: selectedCity.label
            }
        }));
    };

    const [showModal, setShowModal] = useState(false);

    const handleDeactivateClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleConfirmDeactivate = async () => {
        try {
            const response = await axios.delete(`http://localhost:8000/api/dsa/deactivate/${dsaId}`);
            if (response.status === 200) {
                alert('Account deactivated successfully.');
                // navigate('/dsa/dashboard');
            }
        } catch (error) {
            console.error('Error deactivating account:', error);
        }
        setShowModal(false);
    };

    return (
        <>
            <Container fluid className={`Customer-basic-view-container ${isSidebarExpanded ? 'sidebar-expanded' : ''}`}>
                <div style={{ paddingBottom: '18px' }}>
                <PathnameUrlPath location={location} homepage={homepage} />
                </div>
                <Row className="Section-1-Row">
                    <Col className="New-Customer-container-second basic-view-col">
                        <Row>
                            <Col lg={9} style={{}}>
                                <span className="basic-view-head" style={{marginTop:'50px'}}>DSA Profile</span>
                                {formData.dsa_status === 'inactive' ? (
                                    <span style={{ margin: '5px', color: 'red', fontWeight: "500" }}><GoDotFill />InActive</span>
                                ) : (
                                    <span style={{ margin: '5px', color: 'green', fontWeight: "500" }}><GoDotFill />Active</span>
                                )}
                            </Col>
                            <Col lg={2} style={{ display: 'flex', justifyContent: "flex-end" }}>
                                {/* <div><a href="#" onClick={genrepdf}>Profile Download</a></div> */}
                            </Col>
                            <Col style={{ display: 'flex', justifyContent: "flex-end" }}>
                                {!editingMode && (
                                    <Button style={{ width: "80px", marginTop:'-20px'}} onClick={() => setEditingMode(true)}>Edit</Button>
                                )}
                            </Col>
                            <hr style={{ margin: "5px", width: "100%" }} />
                        </Row>
                        <Row className="Row1 view-row-size">
                            <Col className='basic-col-width' lg={2}><span className="customer-sentence">Name</span></Col>
                            <Col>
                                <input
                                    type="text"
                                    className="box"
                                    name="dsaName"
                                    value={formData.dsaName}
                                    onChange={handleChange}
                                    readOnly={!editingMode}
                                    placeholder={formData.dsaName}
                                />
                            </Col>
                        </Row>
                        <Row className="Row1 view-row-size">
                            <Col className='basic-col-width' lg={2}><span className="customer-sentence">Company Name</span></Col>
                            <Col>
                                <input
                                    type="text"
                                    className="box"
                                    name="dsaCompanyName"
                                    value={formData.dsaCompanyName}
                                    onChange={handleChange}
                                    readOnly={!editingMode}
                                    placeholder={formData.dsaCompanyName}
                                />
                            </Col>
                        </Row>
                        <Row className="Row1 view-row-size">
                            <Col className='basic-col-width' lg={2}><span className="customer-sentence">Mobile Number</span></Col>
                            <Col>
                                <input
                                    type="text"
                                    className="box"
                                    name="primaryNumber"
                                    value={formData.primaryNumber}
                                    onChange={handleChange}
                                    readOnly={!editingMode}
                                    placeholder={formData.primaryNumber}
                                />
                            </Col>
                        </Row>
                        <Row className="Row1 view-row-size">
                            <Col className='basic-col-width' lg={2}><span className="customer-sentence">Alternate Number</span></Col>
                            <Col>
                                <input
                                    type="text"
                                    className="box"
                                    name="alternateNumber"
                                    value={formData.alternateNumber}
                                    onChange={handleChange}
                                    readOnly={!editingMode}
                                    placeholder={formData.alternateNumber}
                                />
                            </Col>
                        </Row>
                        <Row className="Row1 view-row-size">
                            <Col className='basic-col-width' lg={2}><span className="customer-sentence">Whatsapp Number</span></Col>
                            <Col>
                                <input
                                    type="text"
                                    className="box"
                                    name="whatsappNumber"
                                    value={formData.whatsappNumber}
                                    onChange={handleChange}
                                    readOnly={!editingMode}
                                    placeholder={formData.whatsappNumber}
                                />
                            </Col>
                        </Row>
                        <Row className="Row1 view-row-size">
                            <Col className='basic-col-width' lg={2}><span className="customer-sentence">Email</span></Col>
                            <Col>
                                <input
                                    type="email"
                                    className="box"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    readOnly={!editingMode}
                                    placeholder={formData.email}
                                />
                            </Col>
                        </Row>
                        <Row className="Row1 view-row-size">
                            <Col className='basic-col-width' lg={2}><span className="customer-sentence">Website</span></Col>
                            <Col>
                                <input
                                    type="text"
                                    className="box"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    readOnly={!editingMode}
                                    placeholder={formData.website}
                                />
                            </Col>
                        </Row>
                        <hr></hr>
                        {editingMode && (
                            <Row>
                                <Col lg={10}>
                                    <Button className="update-button" onClick={handleSubmit}>Update</Button>
                                </Col>
                            </Row>
                        )}

                        <DSA_AddressForm />
                        <hr />
                        <DSA_Branck_Details/>
                        <hr/>
                        <DSA_Loan_Details />
                        <hr />

                        <Row>
                            <div style={{ textAlign: "end" }}>
                                <a href='' style={{ textDecoration: "none" }} onClick={(e) => {e.preventDefault(); handleDeactivateClick(); }}>
                                    Are you Delete Your Account ?
                                </a>
                            </div>
                        </Row>
                    </Col>
                </Row>
            </Container>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Account Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete your account?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        No
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDeactivate}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default DSA_Updation;
