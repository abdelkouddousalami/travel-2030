package com.example.backend.config;

import com.example.backend.model.Destination;
import com.example.backend.model.User;
import com.example.backend.repository.DestinationRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@travel2030.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            admin.setEmailVerified(true);
            userRepository.save(admin);
            System.out.println(" Admin user created: username=admin, password=admin123");
        }

        if (!userRepository.existsByUsername("user")) {
            User user = new User();
            user.setUsername("user");
            user.setEmail("user@travel2030.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole(User.Role.USER);
            user.setEmailVerified(true);
            userRepository.save(user);
            System.out.println(" Regular user created: username=user, password=user123");
        }

        if (destinationRepository.count() == 0) {
            createSampleDestinations();
            System.out.println(" Sample destinations created");
        }
    }

    private void createSampleDestinations() {
        Destination paris = new Destination();
        paris.setName("Paris, City of Light");
        paris.setDescription("Experience the romance and culture of Paris with its iconic Eiffel Tower, world-class museums, and charming cafés.");
        paris.setCountry("France");
        paris.setCity("Paris");
        paris.setLatitude(48.8566);
        paris.setLongitude(2.3522);
        paris.setPricePerNight(new BigDecimal("200.00"));
        paris.setCategory(Destination.Category.CITY);
        paris.setImageUrl("https://images.unsplash.com/photo-1502602898657-3e91760cbb34");
        destinationRepository.save(paris);

        Destination bali = new Destination();
        bali.setName("Bali Paradise");
        bali.setDescription("Tropical paradise with stunning beaches, ancient temples, and lush rice terraces.");
        bali.setCountry("Indonesia");
        bali.setCity("Bali");
        bali.setLatitude(-8.3405);
        bali.setLongitude(115.0920);
        bali.setPricePerNight(new BigDecimal("150.00"));
        bali.setCategory(Destination.Category.BEACH);
        bali.setImageUrl("https://images.unsplash.com/photo-1537996194471-e657df975ab4");
        destinationRepository.save(bali);

        Destination alps = new Destination();
        alps.setName("Swiss Alps Adventure");
        alps.setDescription("Breathtaking mountain landscapes perfect for skiing, hiking, and nature lovers.");
        alps.setCountry("Switzerland");
        alps.setCity("Interlaken");
        alps.setLatitude(46.6863);
        alps.setLongitude(7.8632);
        alps.setPricePerNight(new BigDecimal("300.00"));
        alps.setCategory(Destination.Category.MOUNTAIN);
        alps.setImageUrl("https://images.unsplash.com/photo-1531366936337-7c912a4589a7");
        destinationRepository.save(alps);

        Destination tokyo = new Destination();
        tokyo.setName("Tokyo Metropolis");
        tokyo.setDescription("Modern city blending tradition with cutting-edge technology, amazing food, and vibrant culture.");
        tokyo.setCountry("Japan");
        tokyo.setCity("Tokyo");
        tokyo.setLatitude(35.6762);
        tokyo.setLongitude(139.6503);
        tokyo.setPricePerNight(new BigDecimal("180.00"));
        tokyo.setCategory(Destination.Category.CITY);
        tokyo.setImageUrl("https://images.unsplash.com/photo-1540959733332-eab4deabeeaf");
        destinationRepository.save(tokyo);

        Destination iceland = new Destination();
        iceland.setName("Iceland Northern Lights");
        iceland.setDescription("Witness the Northern Lights, explore volcanic landscapes, and relax in natural hot springs.");
        iceland.setCountry("Iceland");
        iceland.setCity("Reykjavik");
        iceland.setLatitude(64.1466);
        iceland.setLongitude(-21.9426);
        iceland.setPricePerNight(new BigDecimal("250.00"));
        iceland.setCategory(Destination.Category.ADVENTURE);
        iceland.setImageUrl("https://images.unsplash.com/photo-1504893524553-b855bce32c67");
        destinationRepository.save(iceland);

        Destination maldives = new Destination();
        maldives.setName("Maldives Beach Resort");
        maldives.setDescription("Luxury overwater bungalows, crystal clear waters, and pristine white sand beaches.");
        maldives.setCountry("Maldives");
        maldives.setCity("Malé");
        maldives.setLatitude(3.2028);
        maldives.setLongitude(73.2207);
        maldives.setPricePerNight(new BigDecimal("500.00"));
        maldives.setCategory(Destination.Category.BEACH);
        maldives.setImageUrl("https://images.unsplash.com/photo-1514282401047-d79a71a590e8");
        destinationRepository.save(maldives);
    }
}
