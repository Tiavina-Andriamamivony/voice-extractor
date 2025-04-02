// import React, { useState } from 'react';
// import  extractAudioFromVideo  from '../logic/extract';

// const AudioExtractor: React.FC = () => {
//     const [isExtracting, setIsExtracting] = useState(false);
//     const [message, setMessage] = useState<string>('');

//     const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (!file) return;

//         setIsExtracting(true);
//         setMessage('Extraction en cours...');

//         try {
//             const outputPath = `${file.name.split('.')[0]}.mp3`;
//             await extractAudioFromVideo(file.path, outputPath);
//             setMessage('Extraction réussie !');
//         } catch (error) {
//             setMessage(`Erreur lors de l'extraction: ${error.message}`);
//         } finally {
//             setIsExtracting(false);
//         }
//     };

//     return (
//         <div className="p-4">
//             <h2 className="text-xl font-bold mb-4">Extracteur Audio</h2>
            
//             <div className="mb-4">
//                 <input
//                     type="file"
//                     accept="video/*"
//                     onChange={handleFileSelect}
//                     disabled={isExtracting}
//                     className="block w-full text-sm text-gray-500
//                         file:mr-4 file:py-2 file:px-4
//                         file:rounded-full file:border-0
//                         file:text-sm file:font-semibold
//                         file:bg-blue-50 file:text-blue-700
//                         hover:file:bg-blue-100"
//                 />
//             </div>

//             {message && (
//                 <div className={`mt-4 p-3 rounded ${
//                     message.includes('Erreur') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
//                 }`}>
//                     {message}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AudioExtractor;