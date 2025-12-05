import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, CircularProgress, Alert, IconButton, Modal, CardActionArea } from '@mui/material';
import Slider from 'react-slick';
import { getAllTrainers } from '../../services/gymService';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import gousisImage from '../../assets/images/trainers/Gousis.jpg';
import mavridisImage from '../../assets/images/trainers/Mavridis.jpg';
import georgImage from '../../assets/images/trainers/Georg.jpg';
import gousiImage from '../../assets/images/trainers/Gousi.jpg';
import savvidouImage from '../../assets/images/trainers/Savvidou.jpg';
import petridisImage from '../../assets/images/trainers/Petridis.jpg';
import defaultTrainerImage from '../../assets/images/trainers/Default.jpg';

const trainerImageMap = {
    'Γούσης': gousisImage,
    'Μαυρίδης': mavridisImage,
    'Γεωργούλα': georgImage,
    'Γούση': gousiImage,
    'Σαββίδου': savvidouImage,
    'Πετρίδης': petridisImage
};

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 }, bgcolor: 'background.paper', border: '2px solid #000',
  boxShadow: 24, p: 4, borderRadius: 2
};

function NextArrow(props) {
  const { onClick } = props;
  return (
    <IconButton onClick={onClick} sx={{ position: 'absolute', top: '50%', right: -40, transform: 'translateY(-50%)', zIndex: 2, color: 'black' }}>
      <ArrowForwardIosIcon />
    </IconButton>
  );
}

function PrevArrow(props) {
  const { onClick } = props;
  return (
    <IconButton onClick={onClick} sx={{ position: 'absolute', top: '50%', left: -40, transform: 'translateY(-50%)', zIndex: 2, color: 'black' }}>
      <ArrowBackIosNewIcon />
    </IconButton>
  );
}

export default function TrainersSection() {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrainer, setSelectedTrainer] = useState(null);

    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const data = await getAllTrainers();
                setTrainers(data);
            } catch (err) {
                setError('Αδυναμία φόρτωσης των γυμναστών.');
            } finally {
                setLoading(false);
            }
        };
        fetchTrainers();
    }, []);

    const handleOpenModal = (trainer) => {
        setSelectedTrainer(trainer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTrainer(null);
    };

    const sliderSettings = {
        dots: true,
        infinite: trainers.length > 3,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 10000,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            { breakpoint: 900, settings: { slidesToShow: 2, infinite: trainers.length > 2 } },
            { breakpoint: 600, settings: { slidesToShow: 1, infinite: trainers.length > 1, arrows: false } }
        ]
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ py: 5, backgroundColor: '#f5f5f5', px: { xs: 2, sm: 6 } }}>
            <Typography variant="h4" component="h2" gutterBottom align="center" fontWeight="bold">Γνωρίστε τους Γυμναστές μας</Typography>
            
            <Slider {...sliderSettings}>
                {trainers.map((trainer) => (
                    <Box key={trainer.id} sx={{ p: 2 }}>
                        <Card component={CardActionArea} onClick={() => handleOpenModal(trainer)} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 380, textAlign: 'center' }}>
                            <CardMedia
                                component="img"
                                height="280"
                                image={trainerImageMap[trainer.lastName] || defaultTrainerImage}
                                alt={`${trainer.firstName} ${trainer.lastName}`}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h5" component="div">
                                    {trainer.firstName} {trainer.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {trainer.specialties || 'Πιστοποιημένος Γυμναστής'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Slider>

            <Modal open={isModalOpen} onClose={handleCloseModal}>
                <Box sx={modalStyle}>
                    {selectedTrainer && (
                        <>
                            <CardMedia
                                component="img"
                                height="250"
                                image={trainerImageMap[selectedTrainer.lastName] || defaultTrainerImage}
                                alt={`${selectedTrainer.firstName} ${selectedTrainer.lastName}`}
                                sx={{ mb: 2, borderRadius: 1 }}
                            />
                            <Typography variant="h4" component="h2" gutterBottom>
                                {selectedTrainer.firstName} {selectedTrainer.lastName}
                            </Typography>
                            <Typography variant="h6" color="primary" gutterBottom>
                                {selectedTrainer.specialties}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 2, maxHeight: 200, overflowY: 'auto' }}>
                                {selectedTrainer.bio}
                            </Typography>
                        </>
                    )}
                </Box>
            </Modal>
        </Box>
    );
}