import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'backend/src/data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Collection {
  constructor(name, defaultData = []) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error(`Error reading ${this.name} JSON file:`, e);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`Error writing ${this.name} JSON file:`, e);
    }
  }

  find(query = {}) {
    const list = this.read();
    return list.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  findOne(query = {}) {
    const list = this.read();
    return list.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  }

  findById(id) {
    const list = this.read();
    return list.find(item => String(item._id) === String(id)) || null;
  }

  create(data) {
    const list = this.read();
    const newItem = {
      _id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    list.push(newItem);
    this.write(list);
    return newItem;
  }

  findByIdAndUpdate(id, updateData) {
    const list = this.read();
    const index = list.findIndex(item => String(item._id) === String(id));
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.write(list);
    return list[index];
  }

  findByIdAndDelete(id) {
    const list = this.read();
    const index = list.findIndex(item => String(item._id) === String(id));
    if (index === -1) return null;
    const deleted = list.splice(index, 1);
    this.write(list);
    return deleted[0];
  }
}

export const db = {
  users: new Collection('users'),
  categories: new Collection('categories'),
  products: new Collection('products'),
  customers: new Collection('customers'),
  suppliers: new Collection('suppliers'),
  sales: new Collection('sales'),
  employees: new Collection('employees')
};
