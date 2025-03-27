const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // استيراد middleware CORS
const fs = require('fs').promises;

const app = express();
const port = 3001; // منفذ مختلف عن موقع الويب الرئيسي لتجنب التعارض
const ratingsFilePath = 'ratings.json'; // ملف لحفظ التقييمات

app.use(cors()); // تفعيل CORS لجميع المسارات (يمكن تخصيصه لاحقًا)
app.use(bodyParser.json());
app.use(express.static(__dirname));

// دالة مساعدة لقراءة التقييمات من الملف
async function loadRatingsFromFile() {
    try {
        const data = await fs.readFile(ratingsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return []; // الملف غير موجود، إرجاع مصفوفة فارغة
        }
        console.error("فشل تحميل التقييمات من الملف:", error);
        return [];
    }
}

// دالة مساعدة لحفظ التقييمات في الملف
async function saveRatingsToFile(ratings) {
    try {
        await fs.writeFile(ratingsFilePath, JSON.stringify(ratings, null, 2), 'utf8');
        console.log('تم حفظ التقييمات بنجاح في ملف ratings.json');
    } catch (error) {
        console.error("فشل حفظ التقييمات في ملف ratings.json:", error);
        throw error;
    }
}

// نقطة نهاية لجلب جميع التقييمات (GET /api/ratings)
app.get('/api/ratings', async (req, res) => {
    try {
        const ratings = await loadRatingsFromFile();
        res.json(ratings);
    } catch (error) {
        res.status(500).json({ message: 'فشل في جلب التقييمات', error: error.message });
    }
});

// نقطة نهاية لإضافة تقييم جديد (POST /api/ratings)
app.post('/api/ratings', async (req, res) => {
    const newRating = req.body;
    if (!newRating) {
        return res.status(400).json({ message: 'التقييم الجديد مفقود في الطلب' });
    }

    try {
        const existingRatings = await loadRatingsFromFile();
        existingRatings.push(newRating);
        await saveRatingsToFile(existingRatings);
        res.status(201).json({ message: 'تم حفظ التقييم بنجاح', rating: newRating }); // إرجاع التقييم الجديد في الاستجابة
    } catch (error) {
        res.status(500).json({ message: 'فشل في حفظ التقييم', error: error.message });
    }
});

// نقطة نهاية لتعديل تقييم موجود (PUT /api/ratings/:id) - اختياري، يمكنك إضافتها لاحقًا إذا احتجت إليها
// app.put('/api/ratings/:id', async (req, res) => { ... });

// نقطة نهاية لحذف تقييم (DELETE /api/ratings/:id) - اختياري، يمكنك إضافتها لاحقًا إذا احتجت إليها
// app.delete('/api/ratings/:id', async (req, res) => { ... });

app.listen(port, () => {
    console.log(`API التقييمات يستمع على المنفذ ${port}`);
});