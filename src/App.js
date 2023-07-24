import React, { useEffect, useState } from 'react';
import db from './firebase';
import './styles.css';

function App() {
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    quantity: '',
    description: '',
  });

  useEffect(() => {
    const fetchMaterials = async () => {
      const snapshot = await db.collection('materials').get();
      const materialList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMaterials(materialList);
    };

    fetchMaterials();

    const unsubscribe = db.collection('materials').onSnapshot((snapshot) => {
      const updatedMaterials = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMaterials(updatedMaterials);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewMaterial((prevMaterial) => ({
      ...prevMaterial,
      [name]: value,
    }));
  };

  const handleIncreaseQuantity = async (materialId) => {
    const updatedMaterials = materials.map((material) => {
      if (material.id === materialId) {
        return {
          ...material,
          quantity: parseInt(material.quantity) + 1,
        };
      }
      return material;
    });
  
    setMaterials(updatedMaterials);
  
    try {
      await db.collection('materials').doc(materialId).update({
        quantity: updatedMaterials.find((m) => m.id === materialId).quantity,
      });
    } catch (error) {
      console.error('Error updating material quantity: ', error);
    }
  };
  
  const handleDecreaseQuantity = async (materialId) => {
    const updatedMaterials = materials.map((material) => {
      if (material.id === materialId && parseInt(material.quantity) > 0) {
        return {
          ...material,
          quantity: parseInt(material.quantity) - 1,
        };
      }
      return material;
    });
  
    setMaterials(updatedMaterials);
  
    try {
      await db.collection('materials').doc(materialId).update({
        quantity: updatedMaterials.find((m) => m.id === materialId).quantity,
      });
    } catch (error) {
      console.error('Error updating material quantity: ', error);
    }
  };
  
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      await db.collection('materials').add(newMaterial);
      setNewMaterial({ name: '', quantity: '', description: '' });
    } catch (error) {
      console.error('Error adding material: ', error);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    try {
      await db.collection('materials').doc(materialId).delete();
    } catch (error) {
      console.error('Error deleting material: ', error);
    }
  };

  return (
    <div>
      <h1>Material Inventory App</h1>
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Material Name"
          value={newMaterial.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="quantity"
          placeholder="Quantity"
          value={newMaterial.quantity}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newMaterial.description}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Add Material</button>
      </form>
      <ul>
  {materials.map((material) => (
    <li key={material.id}>
      <h3>{material.name}</h3>
      <p>Quantity: {material.quantity}</p>
      <p>Description: {material.description}</p>
      <button onClick={() => handleDeleteMaterial(material.id)}>
        Delete
      </button>
      <button onClick={() => handleIncreaseQuantity(material.id)}>
        Increase Quantity
      </button>
      <button onClick={() => handleDecreaseQuantity(material.id)}>
        Decrease Quantity
      </button>
    </li>
  ))}
</ul>

    </div>
  );
}

export default App;
