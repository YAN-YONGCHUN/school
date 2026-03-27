let dataStore = {
    users: [],
    mountains: [],
    orders: [],
    rentals: [],
    partners: [],
    partnerApplications: [],
    products: [],
    adminUsers: []
};

function initializeData() {
    if (dataStore.users.length === 0) {
        dataStore.users = [
            {
                id: '1',
                name: '登山爱好者',
                phone: '13800138000',
                email: 'demo@example.com',
                password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.eG1H2Ijz8VZL8YfV2a',
                status: 'active',
                registerTime: '2024-01-01',
                climbCount: 10
            }
        ];
    }
    
    if (dataStore.mountains.length === 0) {
        dataStore.mountains = [
            {
                id: 1,
                name: '泰山',
                location: '山东省泰安市',
                altitude: 1545,
                difficulty: '中等',
                rating: 4.8,
                views: 12580,
                description: '五岳之首，天下第一山',
                image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
                badges: ['日出观赏', '云海奇观', '五岳独尊'],
                isNew: true
            },
            {
                id: 2,
                name: '华山',
                location: '陕西省华阴市',
                altitude: 2155,
                difficulty: '困难',
                rating: 4.9,
                views: 9870,
                description: '奇险天下第一山',
                image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
                badges: ['长空栈道', '日出东方', '险峰之最'],
                isNew: false
            },
            {
                id: 3,
                name: '黄山',
                location: '安徽省黄山市',
                altitude: 1864,
                difficulty: '中等',
                rating: 4.9,
                views: 15620,
                description: '五岳归来不看山，黄山归来不看岳',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                badges: ['云海', '奇松', '温泉'],
                isNew: true
            },
            {
                id: 4,
                name: '峨眉山',
                location: '四川省乐山市',
                altitude: 3099,
                difficulty: '困难',
                rating: 4.7,
                views: 8540,
                description: '佛教名山，普贤菩萨道场',
                image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800',
                badges: ['金顶日出', '佛光', '灵猴'],
                isNew: false
            },
            {
                id: 5,
                name: '庐山',
                location: '江西省九江市',
                altitude: 1474,
                difficulty: '简单',
                rating: 4.6,
                views: 7230,
                description: '不识庐山真面目，只缘身在此山中',
                image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800',
                badges: ['瀑布', '云雾', '避暑胜地'],
                isNew: false
            },
            {
                id: 6,
                name: '武夷山',
                location: '福建省南平市',
                altitude: 2158,
                difficulty: '中等',
                rating: 4.7,
                views: 6890,
                description: '世界文化与自然双重遗产',
                image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
                badges: ['九曲溪', '大红袍', '丹霞地貌'],
                isNew: true
            }
        ];
    }
    
    if (dataStore.products.length === 0) {
        dataStore.products = [
            { id: 1, name: '泰山限定徽章', category: '徽章', price: 29, stock: 100, sales: 1234, badge: '热销', desc: '五岳之首纪念徽章', status: 'active' },
            { id: 2, name: '华山勇士徽章', category: '徽章', price: 35, stock: 80, sales: 856, badge: '', desc: '挑战险峰专属徽章', status: 'active' },
            { id: 3, name: '登山主题T恤', category: '服饰', price: 89, stock: 50, sales: 2341, badge: '热销', desc: '100%纯棉舒适透气', status: 'active' },
            { id: 4, name: '登山帽', category: '服饰', price: 59, stock: 120, sales: 1567, badge: '', desc: '防晒透气专业帽', status: 'active' },
            { id: 5, name: '登山背包', category: '周边', price: 129, stock: 30, sales: 987, badge: '新品', desc: '大容量轻便背包', status: 'active' }
        ];
    }
    
    if (dataStore.adminUsers.length === 0) {
        dataStore.adminUsers = [
            { id: '1', account: 'admin', password: 'admin123', name: '超级管理员', role: 'super' },
            { id: '2', account: 'manager', password: 'manager123', name: '运营经理', role: 'manager' },
            { id: '3', account: 'operator', password: 'operator123', name: '运营专员', role: 'operator' }
        ];
    }
    
    if (dataStore.orders.length === 0) {
        dataStore.orders = [
            { id: 'ORD001', userId: '1', product: '泰山限定徽章', amount: 29, time: '2024-03-20 10:30', status: 'completed' },
            { id: 'ORD002', userId: '1', product: '登山主题T恤', amount: 89, time: '2024-03-20 09:15', status: 'shipped' },
            { id: 'ORD003', userId: '1', product: '登山背包', amount: 129, time: '2024-03-19 16:45', status: 'paid' },
            { id: 'ORD004', userId: '1', product: '户外水壶', amount: 49, time: '2024-03-19 14:20', status: 'pending' }
        ];
    }
}

initializeData();

function getData(type) {
    return dataStore[type] || [];
}

function setData(type, data) {
    dataStore[type] = data;
}

function addItem(type, item) {
    item.id = item.id || Date.now().toString();
    dataStore[type].push(item);
    return item;
}

function updateItem(type, id, updates) {
    const index = dataStore[type].findIndex(item => item.id == id);
    if (index > -1) {
        dataStore[type][index] = { ...dataStore[type][index], ...updates };
        return dataStore[type][index];
    }
    return null;
}

function deleteItem(type, id) {
    const index = dataStore[type].findIndex(item => item.id == id);
    if (index > -1) {
        dataStore[type].splice(index, 1);
        return true;
    }
    return false;
}

function findItem(type, key, value) {
    return dataStore[type].find(item => item[key] === value);
}

module.exports = {
    getData,
    setData,
    addItem,
    updateItem,
    deleteItem,
    findItem,
    initializeData
};
