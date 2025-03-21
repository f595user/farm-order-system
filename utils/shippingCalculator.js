const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Cache for shipping rates to avoid reading the CSV file on every calculation
let shippingRatesCache = null;

// Map of common cities to their prefectures
const cityToPrefectureMap = {
  // Hokkaido
  '札幌市': '北海道',
  '函館市': '北海道',
  '旭川市': '北海道',
  '釧路市': '北海道',
  '帯広市': '北海道',
  '北見市': '北海道',
  '夕張市': '北海道',
  '岩見沢市': '北海道',
  '網走市': '北海道',
  '留萌市': '北海道',
  '苫小牧市': '北海道',
  '稚内市': '北海道',
  '美唄市': '北海道',
  '芦別市': '北海道',
  '江別市': '北海道',
  '赤平市': '北海道',
  '紋別市': '北海道',
  '士別市': '北海道',
  '名寄市': '北海道',
  '三笠市': '北海道',
  '根室市': '北海道',
  '千歳市': '北海道',
  '滝川市': '北海道',
  '砂川市': '北海道',
  '歌志内市': '北海道',
  '深川市': '北海道',
  '富良野市': '北海道',
  '登別市': '北海道',
  '恵庭市': '北海道',
  '伊達市': '北海道',
  '北広島市': '北海道',
  '石狩市': '北海道',
  '北斗市': '北海道',
  
  // Tokyo
  '東京': '東京都',
  '新宿区': '東京都',
  '渋谷区': '東京都',
  '品川区': '東京都',
  '目黒区': '東京都',
  '大田区': '東京都',
  '世田谷区': '東京都',
  '中野区': '東京都',
  '杉並区': '東京都',
  '豊島区': '東京都',
  '北区': '東京都',
  '荒川区': '東京都',
  '板橋区': '東京都',
  '練馬区': '東京都',
  '足立区': '東京都',
  '葛飾区': '東京都',
  '江戸川区': '東京都',
  '八王子市': '東京都',
  '立川市': '東京都',
  '武蔵野市': '東京都',
  '三鷹市': '東京都',
  '青梅市': '東京都',
  '府中市': '東京都',
  '昭島市': '東京都',
  '調布市': '東京都',
  '町田市': '東京都',
  '小金井市': '東京都',
  '小平市': '東京都',
  '日野市': '東京都',
  '東村山市': '東京都',
  '国分寺市': '東京都',
  '国立市': '東京都',
  '福生市': '東京都',
  '狛江市': '東京都',
  '東大和市': '東京都',
  '清瀬市': '東京都',
  '東久留米市': '東京都',
  '武蔵村山市': '東京都',
  '多摩市': '東京都',
  '稲城市': '東京都',
  '羽村市': '東京都',
  'あきる野市': '東京都',
  '西東京市': '東京都',
  
  // Osaka
  '大阪市': '大阪府',
  '堺市': '大阪府',
  '岸和田市': '大阪府',
  '豊中市': '大阪府',
  '池田市': '大阪府',
  '吹田市': '大阪府',
  '泉大津市': '大阪府',
  '高槻市': '大阪府',
  '貝塚市': '大阪府',
  '守口市': '大阪府',
  '枚方市': '大阪府',
  '茨木市': '大阪府',
  '八尾市': '大阪府',
  '泉佐野市': '大阪府',
  '富田林市': '大阪府',
  '寝屋川市': '大阪府',
  '河内長野市': '大阪府',
  '松原市': '大阪府',
  '大東市': '大阪府',
  '和泉市': '大阪府',
  '箕面市': '大阪府',
  '柏原市': '大阪府',
  '羽曳野市': '大阪府',
  '門真市': '大阪府',
  '摂津市': '大阪府',
  '高石市': '大阪府',
  '藤井寺市': '大阪府',
  '東大阪市': '大阪府',
  '泉南市': '大阪府',
  '四條畷市': '大阪府',
  '交野市': '大阪府',
  '大阪狭山市': '大阪府',
  '阪南市': '大阪府',
  
  // Add more cities as needed
};

/**
 * Read shipping rates from CSV file
 * @returns {Promise<Array>} Array of shipping rate objects
 */
const readShippingRates = () => {
  return new Promise((resolve, reject) => {
    // If we already have the rates cached, return them
    if (shippingRatesCache) {
      console.log('[SERVER] Using cached shipping rates');
      return resolve(shippingRatesCache);
    }

    const results = [];
    const csvFilePath = path.join(__dirname, '../models/data/postage.csv');
    console.log('[SERVER] Reading CSV file from:', csvFilePath);

    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error('[SERVER] CSV file not found:', csvFilePath);
      return reject(new Error('CSV file not found'));
    }

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('headers', (headers) => {
        console.log('[SERVER] CSV headers:', headers);
      })
      .on('data', (data) => {
        console.log('[SERVER] CSV row data:', data);
        
        // Convert rate strings to numbers
        const rateData = {
          region: data['地域'],
          prefecture: data['都道府県名'],
          rates: {
            '2': parseInt(data['2kgまでの料金'], 10),
            '5': parseInt(data['5kgまでの料金'], 10),
            '10': parseInt(data['10kgまでの料金'], 10)
          }
        };
        console.log('[SERVER] Parsed rate data:', rateData);
        results.push(rateData);
      })
      .on('end', () => {
        // Cache the results
        shippingRatesCache = results;
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Calculate shipping cost based on total weight and destination prefecture
 * @param {number} totalWeight - Total weight in kg
 * @param {string} prefecture - Destination prefecture or city
 * @returns {Promise<number>} Shipping cost
 */
const calculateShippingCost = async (totalWeight, prefecture) => {
  try {
    console.log(`[SERVER] Calculating shipping cost for weight: ${totalWeight}kg, prefecture: ${prefecture}`);
    
    const shippingRates = await readShippingRates();
    console.log(`[SERVER] Loaded ${shippingRates.length} shipping rates`);
    
    // Check if the input is a city and map it to a prefecture
    let prefectureToUse = prefecture;
    if (cityToPrefectureMap[prefecture]) {
      prefectureToUse = cityToPrefectureMap[prefecture];
      console.log(`[SERVER] Mapped city ${prefecture} to prefecture ${prefectureToUse}`);
    }
    
    // Normalize prefecture name by removing any trailing "都", "府", "県"
    const normalizedPrefecture = prefectureToUse.replace(/[都道府県]$/, '');
    console.log(`[SERVER] Normalized prefecture: ${normalizedPrefecture}`);
    
    // Find the rate for the specified prefecture
    let prefectureRate = shippingRates.find(rate => rate.prefecture === prefectureToUse);
    
    // If not found, try with normalized prefecture
    if (!prefectureRate) {
      prefectureRate = shippingRates.find(rate => {
        const normalizedRatePrefecture = rate.prefecture.replace(/[都道府県]$/, '');
        return normalizedRatePrefecture === normalizedPrefecture;
      });
    }
    
    // If still not found, try with partial match
    if (!prefectureRate) {
      prefectureRate = shippingRates.find(rate => 
        rate.prefecture.includes(normalizedPrefecture) || 
        normalizedPrefecture.includes(rate.prefecture.replace(/[都道府県]$/, ''))
      );
    }
    
    if (!prefectureRate) {
      console.error(`[SERVER] Prefecture not found: ${prefecture}`);
      console.log(`[SERVER] Available prefectures:`, shippingRates.map(rate => rate.prefecture));
      return 500; // Default shipping cost if prefecture not found
    }
    
    console.log(`[SERVER] Found rate for ${prefecture}:`, prefectureRate);
    
    // Determine which weight category to use
    let rateKey = '10';
    if (totalWeight <= 2) {
      rateKey = '2';
    } else if (totalWeight <= 5) {
      rateKey = '5';
    }
    
    console.log(`[SERVER] Using rate key: ${rateKey} for weight: ${totalWeight}kg`);
    console.log(`[SERVER] Shipping cost: ${prefectureRate.rates[rateKey]}`);
    
    return prefectureRate.rates[rateKey];
  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    return 500; // Default shipping cost on error
  }
};

// Get all shipping rates
// Returns a Promise that resolves to an array of shipping rate objects
const getAllShippingRates = async () => {
  try {
    return await readShippingRates();
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    return [];
  }
};

module.exports = {
  calculateShippingCost,
  getAllShippingRates
};
