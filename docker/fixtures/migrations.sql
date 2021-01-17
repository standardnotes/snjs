CREATE TABLE `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

INSERT INTO `migrations` (`id`, `timestamp`, `name`) VALUES
('1', '1606470249552', 'initDatabase1606470249552'),
('2', '1610015065194', 'addRevokedSessions1610015065194'),
('3', '1610025371088', 'addForeignKeyToRevokedSessions1610025371088'),
('4', '1610719387757', 'addReceivedRevokedSession1610719387757');
