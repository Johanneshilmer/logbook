import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';

export default function EditModal({ show, onHide, item, handleSaveEdit }) {
  const [formData, setFormData] = useState({
    solderTest: item?.solderTest ?? false,
    comment: item?.comment ?? "",
    radios: item?.radios ?? "TOP",
    solderResult: item?.solderResult ?? "-", // Explicitly default to "-"
  });

  // Predefined radios options
  const radios = [
    { name: 'TOP', value: 'TOP' },
    { name: 'BOTTOM', value: 'BOT' },
    { name: 'SETUP', value: 'SETUP' },
    { name: 'DownTime', value: 'DownTime' },
  ];

  useEffect(() => {
    setFormData({
      solderTest: item?.solderTest ?? false,
      comment: item?.comment ?? "",
      radios: item?.radios ?? "TOP",
      solderResult: item?.solderResult ?? "-", // Explicitly default to "-"
    });
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => {
      if (name === "solderTest") {
        return {
          ...prevData,
          solderTest: checked,
          solderResult: checked ? prevData.solderResult : "-", // Reset solderResult if solderTest is toggled off
        };
      }
      return {
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent submission if solderTest is active but solderResult is invalid
    if (formData.solderTest && formData.solderResult === "-") {
      alert("Please select a solder result.");
      return;
    }

    handleSaveEdit(item.id, formData);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Edit: {item.workOrder}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formSolderTest">
            <Form.Check
              type="switch"
              checked={formData.solderTest}
              id="custom-switch"
              label="Solderability Test"
              name="solderTest"
              onChange={handleChange}
            />
          </Form.Group>

          {/* Conditionally render the dropdown based on solderTest */}
          {formData.solderTest && (
            <Form.Group className="mb-3" controlId="formSolderResult">
              <Form.Label>Test Result</Form.Label>
              <Form.Select
                name="solderResult"
                value={formData.solderResult}
                onChange={handleChange}
              >
                <option value="-">Select result</option>
                <option value="Good">Good</option>
                <option value="Bad">Bad</option>
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group className="mb-3" controlId="formRadios">
            <Form.Label>Select Site</Form.Label>
            <Form.Select
              name="radios"
              value={formData.radios}
              onChange={handleChange}
            >
              {radios.map((radio, index) => (
                <option key={index} value={radio.value}>
                  {radio.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="floatingTextarea">
            <FloatingLabel label="Comments">
              <Form.Control
                as="textarea"
                placeholder="Comments"
                style={{ height: "150px" }}
                value={formData.comment}
                name="comment"
                onChange={handleChange}
              />
            </FloatingLabel>
          </Form.Group>

          <Form.Group className="d-flex flex-row-reverse">
            <Button variant="success" type="submit">
              Save
            </Button>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
