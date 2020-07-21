drop table if exists user;
drop table if exists websites;

create table user(
  username varchar(255) not null primary key,
  password varchar(255) not null,
  dateRegistered DateTime not null
);

create table websites(
  websiteId varchar(36) not null primary key,
  name varchar(255) not null,
  username varchar(255) not null,
  password varchar(255) not null,
  ownerId varchar(255) not null,
  dateAdded DateTime,
  foreign key (ownerId) references user(username) ON UPDATE CASCADE ON DELETE CASCADE
);

drop PROCEDURE if exists GetUser;
drop PROCEDURE if exists GetUserWebsites;
drop PROCEDURE if exists AddWebsite;
drop PROCEDURE if exists AddUser;


delimiter $$
CREATE PROCEDURE GetUser(
  IN in_username varchar(255)
)
BEGIN
  SELECT username, password from user where username=in_username limit 1;
END $$
delimiter ;

delimiter $$
CREATE PROCEDURE GetUserWebsites(
  IN in_username varchar(255)
)
BEGIN
  SELECT name, username, password from websites
  where ownerId=in_username;
END $$
delimiter ;

delimiter $$
CREATE PROCEDURE AddWebsite(
  IN in_website varchar(255),
  IN in_username varchar(255),
  IN in_password varchar(255),
  IN in_ownerId varchar(255)
)
BEGIN
  INSERT INTO websites(websiteId, name, username, password, ownerId, dateAdded)
  values(uuid(), in_website, in_username, in_password, in_ownerId, now());
END $$
delimiter ;

delimiter $$
CREATE PROCEDURE AddUser(
  IN in_username varchar(255),
  IN in_password varchar(255)
)
BEGIN
  INSERT INTO user(username, password, dateRegistered)
  values(in_username, in_password, now());
END $$
delimiter ;
