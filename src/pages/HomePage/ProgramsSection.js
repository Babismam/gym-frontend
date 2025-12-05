import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, CircularProgress, Alert, IconButton, Modal, CardActionArea } from '@mui/material';
import Slider from 'react-slick';
import { getAllPrograms } from '../../services/gymService';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';

import bodyPumpImage from '../../assets/images/programs/Body_Pump.jpg';
import crossfitImage from '../../assets/images/programs/CrossFit.jpg';
import pilatesImage from '../../assets/images/programs/Pilates.jpg';
import spinningImage from '../../assets/images/programs/Spinning.jpg';
import trxImage from '../../assets/images/programs/TRX.jpg';
import yogaImage from '../../assets/images/programs/Yoga.jpg';
import zumbaImage from '../../assets/images/programs/Zumba.jpg';
import defaultProgramImage from '../../assets/images/programs/Default.jpg';

const programImageMap = {
    'Body Pump': bodyPumpImage,
    'CrossFit': crossfitImage,
    'Pilates': pilatesImage,
    'Spinning': spinningImage,
    'TRX': trxImage,
    'Yoga': yogaImage,
    'Zumba': zumbaImage
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

export default function ProgramsSection() {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const data = await getAllPrograms();
                setPrograms(data);
            } catch (err) {
                setError('Αδυναμία φόρτωσης των προγραμμάτων.');
            } finally {
                setLoading(false);
            }
        };
        fetchPrograms();
    }, []);

    const handleOpenModal = (program) => {
        setSelectedProgram(program);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProgram(null);
    };

    const sliderSettings = {
        dots: true,
        infinite: programs.length > 3,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 10000,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            { breakpoint: 900, settings: { slidesToShow: 2, infinite: programs.length > 2 } },
            { breakpoint: 600, settings: { slidesToShow: 1, infinite: programs.length > 1, arrows: false } }
        ]
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ py: 5, backgroundColor: '#ffffff', px: { xs: 2, sm: 6 } }}>
            <Typography variant="h4" component="h2" gutterBottom align="center" fontWeight="bold">Τα Προγράμματά μας</Typography>
            
            <Slider {...sliderSettings}>
                {programs.map((program) => (
                    <Box key={program.id} sx={{ p: 2 }}>
                        <Card component={CardActionArea} onClick={() => handleOpenModal(program)} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 380, textAlign: 'center' }}>
                            <CardMedia
                                component="img"
                                height="280"
                                image={programImageMap[program.name] || defaultProgramImage}
                                alt={program.name}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h5" component="div">
                                    {program.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Slider>

            <Modal open={isModalOpen} onClose={handleCloseModal}>
                <Box sx={modalStyle}>
                    {selectedProgram && (
                        <>
                            <CardMedia
                                component="img"
                                height="200"
                                image={programImageMap[selectedProgram.name] || defaultProgramImage}
                                alt={selectedProgram.name}
                                sx={{ mb: 2, borderRadius: 1 }}
                            />
                            <Typography variant="h4" component="h2" gutterBottom>
                                {selectedProgram.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 2 }}>
                                <AccessTimeIcon sx={{ mr: 1 }} />
                                <Typography variant="body1">Διάρκεια: {selectedProgram.durationMinutes} λεπτά</Typography>
                                <GroupsIcon sx={{ ml: 3, mr: 1 }} />
                                <Typography variant="body1">Έως {selectedProgram.maxParticipants} άτομα</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ mt: 2, maxHeight: 200, overflowY: 'auto' }}>
                                {selectedProgram.description}
                            </Typography>
                        </>
                    )}
                </Box>
            </Modal>
        </Box>
    );
}