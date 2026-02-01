const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Helper to ensure file exists
function ensureFile(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

// Ensure files exist on startup
ensureFile(USERS_FILE);
ensureFile(ORDERS_FILE);

// Generic read/write helpers
async function readJson(filePath) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

async function writeJson(filePath, data) {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}

const Storage = {
    // USERS
    async getUsers() {
        return readJson(USERS_FILE);
    },
    async saveUser(user) {
        const users = await this.getUsers();
        const existingIndex = users.findIndex(u => u.phone === user.phone);

        if (existingIndex >= 0) {
            users[existingIndex] = { ...users[existingIndex], ...user, updated_at: new Date() };
        } else {
            users.push({ ...user, created_at: new Date() });
        }
        await writeJson(USERS_FILE, users);
        return user;
    },
    async findUserByPhone(phone) {
        const users = await this.getUsers();
        return users.find(u => u.phone === phone);
    },

    // ORDERS
    async getOrders() {
        return readJson(ORDERS_FILE);
    },
    async saveOrder(order) {
        const orders = await this.getOrders();
        const existingIndex = orders.findIndex(o => o.id === order.id);

        if (existingIndex >= 0) {
            orders[existingIndex] = { ...orders[existingIndex], ...order, updated_at: new Date() };
        } else {
            orders.unshift({ ...order, created_at: new Date() }); // Add newer orders to top
        }
        await writeJson(ORDERS_FILE, orders);
        return order;
    },
    async getOrderById(id) {
        const orders = await this.getOrders();
        return orders.find(o => o.id === id);
    },
    async getUserOrders(userId) {
        const orders = await this.getOrders();
        return orders.filter(o => o.user_id === userId); // simple filter
    }
};

module.exports = Storage;
